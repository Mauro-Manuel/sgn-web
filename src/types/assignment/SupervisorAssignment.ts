
export interface SupervisorAssignment {
  id: string;
  supervisorId: string;
  supervisorName: string;
  nucleusId: string;
  nucleusName: string;
  startDate: string;
  endDate: string | null;
}
