import React from 'react';
import { useLoaderData } from 'react-router-dom';

export default function ViewOperatorEntries() {
  let { id: checklistId } = useLoaderData();
  return <div>ViewOperatorEntries</div>;
}
