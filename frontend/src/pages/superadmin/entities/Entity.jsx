import React, { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/Button';
import { FaArrowLeft } from 'react-icons/fa';
import Images from '../../../assets/images';
import { FiCamera } from 'react-icons/fi';
import Divider from '../../../shared/components/Divider';
import AdminCard from '../../admin/dashboard/components/AdminCard';
import Icons from '../../../assets/icons';
import { RiEditLine } from 'react-icons/ri';
import { GoDotFill } from 'react-icons/go';
import SuspendEntityModal from './components/SuspendEntityModal';
import {
  useActivateCompany,
  useCompany,
  useCompanyAnalytics,
} from '../../../shared/hooks/superadmin/useCompanies';
import Loader from '../../../shared/components/Loader';
import { formatDate } from '../../../shared/utils/constants';
import useToast from '../../../shared/hooks/useToast';
import EditEntityModal from '../dashboard/components/EditEntityModal';

const AuditData = [
  {
    title: 'Entity suspended',
    reason:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, in.',
    date: 'April 9, 2026',
    time: '9:05 a.m',
    logType: 'suspended',
  },
  {
    title: 'Entity reactivated',
    reason:
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, in.',
    date: 'April 9, 2026',
    time: '9:05 a.m',
    logType: 'reactivated',
  },
];

export default function Entity() {
  let { id: entityId } = useLoaderData();

  const [isSuspendEntityModal, setIsSuspendEntityModal] = useState(false);
  const [isEditEntityModal, setIsEditEntityModal] = useState(false);

  const { data, isPending: isLoading } = useCompany(entityId);

  const companyData = data?.data?.company;

  const navigate = useNavigate();

  const { mutateAsync, isPending: isActivatingCompanyLoading } =
    useActivateCompany();

  const { data: companyAnalytics, isPending: isCompanyAnalyticsLoading } =
    useCompanyAnalytics(entityId);

  const companyAnalyticsData = companyAnalytics?.data;

  const { showError, showSuccess } = useToast();

  const EntityProfileData = [
    {
      key: 'Entity Name',
      value: companyData?.companyName,
    },
    {
      key: 'Tenant ID',
      value: companyData?.companyId,
    },
    {
      key: 'Created',
      value: formatDate(companyData?.createdAt),
    },
  ];

  const AdminAccountData = [
    {
      key: 'Name',
      value: companyData?.contactFullName,
    },
    {
      key: 'Email',
      value: companyData?.contactEmail,
    },
    {
      key: 'Role',
      value: 'Admin',
    },
  ];

  const handleActivateCompany = async () => {
    try {
      await mutateAsync({ companyId: companyData?.companyId, payload: {} });
      showSuccess('Entity activated successfully');
    } catch (error) {
      console.error('Error', error);
      showError('Unable to activate entity. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex w-full max-w-6xl items-start justify-start sm:mb-10">
        <Button
          onClick={() => navigate(-1)}
          className="flex border border-secondary-200 rounded-full gap-1.5 items-center py-1.5 px-2 text-secondary text-sm font-medium"
        >
          <FaArrowLeft className="text-primary" size={12} />
          Back
        </Button>
      </div>

      {isLoading ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : (
        <>
          <div className="flex w-full max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3">
              <Button className="relative w-15 overflow-hidden rounded-full border border-secondary-200">
                <img
                  src={Images.logo}
                  alt="entity logo"
                  className="w-full h-full object-contain"
                />
                <FiCamera
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
                  size={18}
                />
              </Button>
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-medium text-primary sm:text-2xl">
                  {companyData?.companyName}
                </h2>
                <p className="text-sm text-tertiary">
                  {companyData?.companyId}
                </p>
              </div>
            </div>
            {companyData?.status === 'active' ? (
              <Button
                onClick={() => setIsSuspendEntityModal(true)}
                className="flex w-full items-center justify-center rounded-[10px] bg-tertiary-500 px-3 py-2.5 text-sm font-medium text-white sm:w-auto sm:justify-end"
              >
                Suspend entity
              </Button>
            ) : (
              <Button
                onClick={() => handleActivateCompany()}
                className="flex w-full items-center justify-center rounded-[10px] bg-primary-200 px-3 py-2.5 text-sm font-medium text-white sm:w-auto sm:justify-end gap-2"
              >
                Activate entity
                {isActivatingCompanyLoading && (
                  <Loader size="border-white! h-4.5 w-4.5" />
                )}
              </Button>
            )}
          </div>

          <Divider className="my-6! w-full max-w-6xl" />

          <div className="mb-6 grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AdminCard
              icon={Icons.activeUsers}
              title="Active users"
              count={companyAnalyticsData?.totalActiveUsers ?? 0}
              loading={isCompanyAnalyticsLoading}
            />
            <AdminCard
              icon={Icons.logsTodayIcon}
              title="Logs today"
              count={companyAnalyticsData?.totalChecklistsToday ?? 0}
              loading={isCompanyAnalyticsLoading}
            />
            <AdminCard
              icon={Icons.logsWeekIcon}
              title="This week's log"
              count={companyAnalyticsData?.totalChecklistsThisWeek ?? 0}
              loading={isCompanyAnalyticsLoading}
            />
          </div>

          <div className="mb-5 mt-6 grid w-full max-w-6xl grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="flex w-full flex-col items-start rounded-3xl bg-secondary-700 px-1 pb-1">
              <h2 className="my-3.5 mx-5 font-medium text-primary text-sm">
                Entity profile
              </h2>
              <div className="w-full rounded-3xl bg-white p-4">
                {EntityProfileData.map((item, index, array) => {
                  const isLastItem = index === array.length - 1;
                  const isFirstItem = index === 0;
                  return (
                    <React.Fragment key={index}>
                      <div className="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                        <h2 className="w-full text-sm text-tertiary sm:w-[30%]">
                          {item.key}
                        </h2>
                        <div className="flex w-full items-center justify-between gap-3 py-2 text-left sm:w-[70%] sm:justify-end sm:text-end">
                          <h2 className="wrap-break-word text-sm font-medium text-primary">
                            {item.value}
                          </h2>
                          {isFirstItem && (
                            <RiEditLine
                              className="text-primary cursor-pointer"
                              size={12}
                              onClick={() => setIsEditEntityModal(true)}
                            />
                          )}
                        </div>
                      </div>
                      {!isLastItem && (
                        <Divider className="my-4! bg-primary-300!" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <div className="flex w-full flex-col items-start rounded-3xl bg-secondary-700 px-1 pb-1">
              <h2 className="my-3.5 mx-5 font-medium text-primary text-sm">
                Admin account
              </h2>
              <div className="w-full rounded-3xl bg-white p-4">
                {AdminAccountData.map((item, index, array) => {
                  const isLastItem = index === array.length - 1;
                  const isFirstItem = index === 0;
                  return (
                    <React.Fragment key={index}>
                      <div className="flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                        <h2 className="w-full text-sm text-tertiary sm:w-[30%]">
                          {item.key}
                        </h2>
                        <div className="flex w-full items-center justify-between gap-3 py-2 text-left sm:w-[70%] sm:justify-end sm:text-end">
                          <h2 className="break-words text-sm font-medium text-primary">
                            {item.value}
                          </h2>
                          {isFirstItem && (
                            <RiEditLine
                              className="text-primary cursor-pointer"
                              size={12}
                              onClick={() => setIsEditEntityModal(true)}
                            />
                          )}
                        </div>
                      </div>
                      {!isLastItem && (
                        <Divider className="my-4! bg-primary-300!" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* <div className="mt-5 flex w-full max-w-6xl items-center gap-4">
            <div className="flex w-full flex-col items-start rounded-3xl bg-secondary-700 px-1 pb-1">
              <h2 className="my-3.5 mx-5 font-medium text-primary text-sm">
                Audit trail
              </h2>
              <div className="w-full rounded-3xl bg-white p-4">
                {AuditData.map((item, index, array) => {
                  const isLastItem = index === array.length - 1;
                  return (
                    <React.Fragment key={index}>
                      <div className="flex w-full items-start gap-1.5">
                        <div className="text-sm p-1.5 text-tertiary">
                          {item.logType === 'suspended' ? (
                            <GoDotFill className="text-tertiary-500 w-3 mt-1" />
                          ) : (
                            <GoDotFill className="text-primary-200 w-3 mt-1" />
                          )}
                        </div>
                        <div className="flex flex-col py-2 ">
                          <h2 className="text-sm font-medium text-primary mb-2">
                            {item.title}
                          </h2>
                          <p className="text-sm text-tertiary">
                            Reason: {item.reason}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center text-sm text-tertiary">
                            {item.date} <GoDotFill className="w-2 mx-2" />
                            {item.time}
                          </p>
                        </div>
                      </div>
                      {!isLastItem && (
                        <Divider className="my-4! bg-primary-300!" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div> */}
        </>
      )}

      <SuspendEntityModal
        isSuspendEntityModal={isSuspendEntityModal}
        setIsSuspendEntityModal={setIsSuspendEntityModal}
        companyId={companyData?.companyId}
      />

      <EditEntityModal
        isEditEntityModal={isEditEntityModal}
        setIsEditEntityModal={setIsEditEntityModal}
        company={companyData}
        key={companyData?.companyId}
      />
    </div>
  );
}
