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

const EntityProfileData = [
  {
    key: 'Entity Name',
    value: 'Tolaram',
  },
  {
    key: 'Tenant ID',
    value: 'ENT-01',
  },
  {
    key: 'Subdomain',
    value: 'tolaram-logistics.logbook.app',
  },
  {
    key: 'Created',
    value: 'April 9, 2026',
  },
];

const AdminAccountData = [
  {
    key: 'Name',
    value: 'Amara Chukwueze',
  },
  {
    key: 'Email',
    value: 'amara.chuwueze@tolaram.com',
  },
  {
    key: 'Role',
    value: 'Admin',
  },
  {
    key: 'Last seen',
    value: 'April 9, 2026',
  },
];

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
  let data = useLoaderData();

  console.log(data);

  const [isSuspendEntityModal, setIsSuspendEntityModal] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="py-8 flex flex-col items-center justify-center">
      <div className="w-[60%] flex items-start justify-start mb-10">
        <Button
          onClick={() => navigate(-1)}
          className="flex border border-secondary-200 rounded-full gap-1.5 items-center py-1.5 px-2 text-secondary text-sm font-medium"
        >
          <FaArrowLeft className="text-primary" size={12} />
          Back
        </Button>
      </div>

      <div className="w-[60%] flex items-end justify-between">
        <div className="flex items-center gap-3">
          <Button className="relative rounded-full w-15 border border-secondary-200 overflow-hidden">
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
            <h2 className="text-primary font-medium text-2xl">Tolaram</h2>
            <p className="text-sm text-tertiary">ENT-01</p>
          </div>
        </div>
        <Button
          onClick={() => setIsSuspendEntityModal(true)}
          className="flex items-end justify-end px-3 py-2.5 bg-tertiary-500 rounded-[10px] text-white text-sm font-medium"
        >
          Suspend entity
        </Button>
      </div>

      <Divider className="w-[60%] my-6!" />

      <div className="w-[60%] flex items-center gap-4 mb-6">
        <AdminCard icon={Icons.activeUsers} title="Active users" count="150" />
        <AdminCard icon={Icons.logsTodayIcon} title="Logs today" count="150" />
        <AdminCard
          icon={Icons.logsWeekIcon}
          title="This week's log"
          count="150"
        />
      </div>

      <div className="flex items-center gap-4 w-[60%] mt-6 mb-5">
        <div className="w-1/2 flex flex-col items-start px-1 pb-1 bg-secondary-700 rounded-3xl">
          <h2 className="my-3.5 mx-5 font-medium text-primary text-sm">
            Entity profile
          </h2>
          <div className="bg-white w-full rounded-3xl p-4 ">
            {EntityProfileData.map((item, index, array) => {
              const isLastItem = index === array.length - 1;
              const isFirstItem = index === 0;
              return (
                <React.Fragment key={index}>
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-sm w-[30%] text-tertiary">
                      {item.key}
                    </h2>
                    <div className="flex w-[70%] py-2 items-center justify-end text-end gap-3">
                      <h2 className="text-sm font-medium text-primary">
                        {item.value}
                      </h2>
                      {isFirstItem && (
                        <RiEditLine
                          className="text-primary cursor-pointer"
                          size={12}
                        />
                      )}
                    </div>
                  </div>
                  {!isLastItem && <Divider className="my-4! bg-primary-300!" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <div className="w-1/2 flex flex-col items-start px-1 pb-1 bg-secondary-700 rounded-3xl">
          <h2 className="my-3.5 mx-5 font-medium text-primary text-sm">
            Entity profile
          </h2>
          <div className="bg-white w-full rounded-3xl p-4 ">
            {AdminAccountData.map((item, index, array) => {
              const isLastItem = index === array.length - 1;
              const isFirstItem = index === 0;
              return (
                <React.Fragment key={index}>
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-sm w-[30%] text-tertiary">
                      {item.key}
                    </h2>
                    <div className="flex w-[70%] py-2 items-center justify-end text-end gap-3">
                      <h2 className="text-sm font-medium text-primary">
                        {item.value}
                      </h2>
                      {isFirstItem && (
                        <RiEditLine
                          className="text-primary cursor-pointer"
                          size={12}
                        />
                      )}
                    </div>
                  </div>
                  {!isLastItem && <Divider className="my-4! bg-primary-300!" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-[60%] mt-5">
        <div className="w-full flex flex-col items-start px-1 pb-1 bg-secondary-700 rounded-3xl">
          <h2 className="my-3.5 mx-5 font-medium text-primary text-sm">
            Audit trail
          </h2>
          <div className="bg-white w-full rounded-3xl p-4 ">
            {AuditData.map((item, index, array) => {
              const isLastItem = index === array.length - 1;
              return (
                <React.Fragment key={index}>
                  <div className="flex items-start w-full gap-1.5">
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
                      <p className=" text-tertiary text-sm">
                        Reason: {item.reason}
                      </p>
                      <p className="flex items-center text-tertiary text-sm mt-1">
                        {item.date} <GoDotFill className="w-2 mx-2" />
                        {item.time}
                      </p>
                    </div>
                  </div>
                  {!isLastItem && <Divider className="my-4! bg-primary-300!" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <SuspendEntityModal
        isSuspendEntityModal={isSuspendEntityModal}
        setIsSuspendEntityModal={setIsSuspendEntityModal}
      />
    </div>
  );
}
