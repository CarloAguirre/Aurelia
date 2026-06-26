import { useMobileBootstrap } from '../../../shared/hooks/useMobileBootstrap';

export function useManualInspectionCompanies() {
  const bootstrapQuery = useMobileBootstrap();

  return {
    ...bootstrapQuery,
    data: bootstrapQuery.data?.catalogs.companies.filter((company) => company.isContractor),
  };
}
