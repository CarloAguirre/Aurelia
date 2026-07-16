import React from 'react';
import { useMobileInspectionAssignmentScope } from '../../shared/stores/mobileInspectionAssignmentScope.store';
import { useMobileSession } from '../auth/mobileSession.store';
import { InspectionChatScreenV2 } from './InspectionChatScreenV2';
import { useManualInspectionDraft } from './manualInspection.store';

export function InspectionAssistantChatScreen() {
  const user = useMobileSession((state) => state.user);
  const loaded = useMobileInspectionAssignmentScope((state) => state.loaded);
  const inspectorCompanyName = useMobileInspectionAssignmentScope((state) => state.inspectorCompanyName);
  const hydrate = useMobileInspectionAssignmentScope((state) => state.hydrate);
  const setInspectorIdentity = useManualInspectionDraft((state) => state.setInspectorIdentity);

  React.useEffect(() => {
    void hydrate(user);
  }, [hydrate, user]);

  React.useEffect(() => {
    if (!loaded || !user) return;
    setInspectorIdentity(user.fullName, inspectorCompanyName ?? user.companyName ?? 'Sin empresa');
  }, [inspectorCompanyName, loaded, setInspectorIdentity, user]);

  if (!loaded || !user) return null;
  return <InspectionChatScreenV2 />;
}
