import React, { useEffect, useState } from 'react';
import { Layout, Modal, Form, Input, Button, message, InputNumber } from 'antd';

const { Content } = Layout;

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const url = "https://travel-allowance-for-railways.onrender.com"

  useEffect(() => {
    // Check if profile is complete when the user lands on Home
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${url}/api/user/me`, {
        headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const data = await response.json();
      
      // If profile is not complete, show the popup
      if (response.ok && !data.isProfileComplete) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${url}/api/user/update-profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Profile updated successfully!');
        setIsModalOpen(false);
      } else {
        message.error('Failed to update profile');
      }
    } catch (error) {
      message.error('Server error');
      console.log("error",error.message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content className="p-8">
        <h1 className="text-2xl font-bold">Welcome to Rail-TA Dashboard</h1>
        <p>Your journey records will appear here.</p>

        {/* The Professional Details Popup */}
        <Modal 
          title="Service Details Required" 
          open={isModalOpen} 
          onOk={() => form.submit()} 
          confirmLoading={loading}
          closable={false} // Prevent closing without filling details
          maskClosable={false}
        >
          <Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
            <Form.Item name="pfNumber" label="P.F. Number" rules={[{ required: true }]}>
              <Input placeholder="e.g. 24529803793" />
            </Form.Item>
            <Form.Item name="billUnitNo" label="Bill Unit No" rules={[{ required: true }]}>
              <Input placeholder="e.g. 911246" />
            </Form.Item>
            <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
              <Input placeholder="e.g. JE/TM/NED" />
            </Form.Item>
            <Form.Item name="division" label="Division" rules={[{ required: true }]}>
              <Input placeholder="e.g. NANDED" />
            </Form.Item>
            <Form.Item name="headquarters" label="Headquarters" rules={[{ required: true }]}>
              <Input placeholder="e.g. NANDED (NED)" />
            </Form.Item>
            <Form.Item name="railwayZone" label="RailwayZone" rules={[{ required: true }]}>
              <Input placeholder="e.g. SOUTHERN Railways" />
            </Form.Item>
            <Form.Item name="rateOfPay" label="Basic Pay (Rate of Pay)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="rate" label="TA per day" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Dashboard;
