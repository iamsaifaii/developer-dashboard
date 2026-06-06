import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export const WorkspaceInviteHandler: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { acceptInvite, currentUser, isHydratingFromCloud } = useStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Wait until hydration is done
    if (isHydratingFromCloud || !currentUser) return;
    
    if (!token) {
      setStatus('error');
      setErrorMessage('No invite token provided.');
      return;
    }

    const processInvite = async () => {
      try {
        await acceptInvite(token);
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard'); // acceptInvite automatically switches workspace
        }, 2000);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to accept invite. It may have expired or you are using the wrong email.');
      }
    };

    processInvite();
  }, [token, currentUser, isHydratingFromCloud, acceptInvite, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Workspace Invitation</h2>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-neutral-700 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-sm text-neutral-400">Processing your invitation...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-2xl">
              ✓
            </div>
            <p className="text-sm text-neutral-300">Invitation accepted successfully! Redirecting you to the workspace...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <p className="text-sm text-red-400">{errorMessage}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
