
import React from 'react';
import OrganizationMembersManager from './OrganizationMembersManager';

interface OrganizationMembersProps {
  organizationId: string;
}

const OrganizationMembers = ({ organizationId }: OrganizationMembersProps) => {
  return <OrganizationMembersManager organizationId={organizationId} />;
};

export default OrganizationMembers;
