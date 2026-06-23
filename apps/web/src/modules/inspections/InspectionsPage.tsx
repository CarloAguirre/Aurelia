import { InspectionStatus } from '@aurelia/contracts';
import { Placeholder } from '../../shared/components/Placeholder';

const statuses = Object.values(InspectionStatus);

export function InspectionsPage() {
  return (
    <div>
      <Placeholder
        title="Inspecciones"
        description="Listado, creación y flujo de revisión/aprobación de inspecciones."
      />
      <ul>
        {statuses.map((status) => (
          <li key={status}>{status}</li>
        ))}
      </ul>
    </div>
  );
}
