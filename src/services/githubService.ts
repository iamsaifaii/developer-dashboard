import type {
  GithubRepo, GithubIssue, GithubPR, GithubCommit, GithubAnalytics, GithubWeeklyActivity
} from '../types';
import { fetchWithRetry } from './apiClient';

export async function fetchGithubData(githubToken: string) {
  const headers = { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json' };

  // 1. Get real GitHub user info
  const userRes = await fetchWithRetry('https://api.github.com/user', { headers });
  if (userRes.status === 401 || userRes.status === 403) {
    throw new Error("Invalid or expired GitHub token");
  }
  if (!userRes.ok) throw new Error("Failed to fetch user");
  const userData = await userRes.json();
  const realUsername = userData.login;

  // 2. Parallel fetch: repos, open PRs, closed PRs, open issues, closed issues, commits
  const [reposResult, openPRsResult, closedPRsResult, openIssuesResult, closedIssuesResult, eventsResult] =
    await Promise.allSettled([
      fetchWithRetry(`https://api.github.com/user/repos?sort=updated&per_page=30&type=all`, { headers }).then(r => r.json()),
      fetchWithRetry(`https://api.github.com/search/issues?q=author:${realUsername}+type:pr+state:open&per_page=20`, { headers }).then(r => r.json()),
      fetchWithRetry(`https://api.github.com/search/issues?q=author:${realUsername}+type:pr+state:closed&per_page=20`, { headers }).then(r => r.json()),
      fetchWithRetry(`https://api.github.com/search/issues?q=assignee:${realUsername}+type:issue+state:open&per_page=20`, { headers }).then(r => r.json()),
      fetchWithRetry(`https://api.github.com/search/issues?q=assignee:${realUsername}+type:issue+state:closed&per_page=20`, { headers }).then(r => r.json()),
      fetchWithRetry(`https://api.github.com/search/commits?q=author:${realUsername}&sort=committer-date&order=desc&per_page=100`, { headers }).then(r => r.json()),
    ]);

  // 3. Process repos
  const repos: GithubRepo[] = reposResult.status === 'fulfilled' && Array.isArray(reposResult.value)
    ? reposResult.value.map((r: any) => ({
        name: r.name,
        description: r.description || '',
        stars: r.stargazers_count,
        forks: r.forks_count,
        openIssues: r.open_issues_count,
        language: r.language || null,
        updatedAt: r.updated_at,
        isPrivate: r.private,
        url: r.html_url
      }))
    : [];

  // 4. Process PRs
  const mapPR = (p: any, merged = false): GithubPR => {
    const repoUrlParts = p.repository_url.split('/');
    const isMerged = merged || !!p.pull_request?.merged_at;
    return {
      id: `pr-${p.id}`,
      number: p.number,
      title: p.title,
      state: p.state,
      url: p.html_url,
      repoName: repoUrlParts[repoUrlParts.length - 1],
      merged: isMerged,
      createdAt: p.created_at,
      closedAt: p.closed_at || null,
      mergedAt: p.pull_request?.merged_at || null
    };
  };

  const openPRItems = openPRsResult.status === 'fulfilled' ? (openPRsResult.value.items || []) : [];
  const closedPRItems = closedPRsResult.status === 'fulfilled' ? (closedPRsResult.value.items || []) : [];
  const allPRs: GithubPR[] = [
    ...openPRItems.slice(0, 15).map((p: any) => mapPR(p, false)),
    ...closedPRItems.slice(0, 15).map((p: any) => mapPR(p, false))
  ];

  // 5. Process Issues
  const mapIssue = (i: any): GithubIssue => {
    const repoUrlParts = i.repository_url.split('/');
    return {
      id: `issue-${i.id}`,
      number: i.number,
      title: i.title,
      state: i.state,
      url: i.html_url,
      repoName: repoUrlParts[repoUrlParts.length - 1],
      labels: (i.labels || []).map((l: any) => l.name),
      createdAt: i.created_at,
      closedAt: i.closed_at || null,
      assignee: i.assignee?.login || null
    };
  };

  const openIssueItems = openIssuesResult.status === 'fulfilled' ? (openIssuesResult.value.items || []) : [];
  const closedIssueItems = closedIssuesResult.status === 'fulfilled' ? (closedIssuesResult.value.items || []) : [];
  const allIssues: GithubIssue[] = [
    ...openIssueItems.slice(0, 15).map(mapIssue),
    ...closedIssueItems.slice(0, 10).map(mapIssue)
  ];

  // 6. Process commits from search
  const commits: GithubCommit[] = [];
  if (eventsResult.status === 'fulfilled' && eventsResult.value.items) {
    eventsResult.value.items.forEach((c: any) => {
      commits.push({
        id: c.sha,
        sha: c.sha,
        message: c.commit.message.split('\n')[0],
        date: c.commit.committer.date.split('T')[0],
        repoName: c.repository?.name || 'unknown',
        author: realUsername
      });
    });
  }

  // 7. Build analytics aggregate
  const commitCounts: Record<string, number> = {};
  commits.forEach(c => { commitCounts[c.date] = (commitCounts[c.date] || 0) + 1; });

  const languageBreakdown: Record<string, number> = {};
  repos.forEach(r => {
    if (r.language) {
      languageBreakdown[r.language] = (languageBreakdown[r.language] || 0) + 1;
    }
  });

  const weeklyActivity: GithubWeeklyActivity[] = [];
  const now = new Date();
  for (let w = 11; w >= 0; w--) {
    const weekSunday = new Date(now);
    weekSunday.setDate(now.getDate() - now.getDay() - w * 7);
    const weekStart = weekSunday.toISOString().split('T')[0];
    let total = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekSunday);
      day.setDate(weekSunday.getDate() + d);
      const dayStr = day.toISOString().split('T')[0];
      total += commitCounts[dayStr] || 0;
    }
    weeklyActivity.push({ weekStart, total });
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (commitCounts[dateStr] && commitCounts[dateStr] > 0) {
      streak++;
      if (i === 0) currentStreak = streak;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      if (i === 0) currentStreak = 0;
      streak = 0;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const totalOpenPRs = openPRItems.length;
  const mergedPRs = closedPRItems.filter((p: any) => p.pull_request?.merged_at);
  const totalMergedPRs = mergedPRs.length;
  const totalClosedPRs = closedPRItems.length - totalMergedPRs;

  const analytics: GithubAnalytics = {
    totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
    totalForks: repos.reduce((sum, r) => sum + r.forks, 0),
    totalCommits: commits.length,
    currentStreak,
    longestStreak,
    languageBreakdown,
    weeklyActivity,
    totalOpenPRs,
    totalClosedPRs,
    totalMergedPRs,
    totalOpenIssues: openIssueItems.length,
    totalClosedIssues: closedIssueItems.length
  };

  return {
    realUsername,
    repos,
    issues: allIssues,
    prs: allPRs,
    commits,
    analytics
  };
}
