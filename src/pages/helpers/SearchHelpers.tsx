import { Dispatch, SetStateAction } from 'react';
import ModernHelperSearch from '../../components/helpers/ModernHelperSearch';
import { useAuth } from '../../lib/contexts/AuthContext';
import type { Page } from '@/lib/utils/types';

type SearchHelpersProps = {
  setPage: Dispatch<SetStateAction<Page>>;
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
