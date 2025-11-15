import { Dispatch, SetStateAction } from 'react';
import ModernHelperSearch from '../../components/helpers/ModernHelperSearch';
import { useAuth } from '../../lib/contexts/AuthContext';
import type { ClientPage } from '@/lib/utils/types';

type SearchHelpersProps = {
  setPage: Dispatch<SetStateAction<ClientPage>>;
}

function SearchHelpers({ setPage }: SearchHelpersProps) {
  const { authRoute, isAuthenticated } = useAuth();

  if (!isAuthenticated || authRoute !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100">
      <ModernHelperSearch setPage={setPage} />
    </div>
  );
};

export default SearchHelpers;
