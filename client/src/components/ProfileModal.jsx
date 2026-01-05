import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { api } from '../utils/api';

const ProfileModal = ({ isOpen, onComplete }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await api.updateProfile(values);
      if (response.ok) {
        message.success('Profile updated successfully!');
        onComplete(); // Tells parent to hide modal
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
    <Modal 
      title="Service Details Required" 
      open={isOpen} 
      onOk={() => form.submit()} 
      confirmLoading={loading}
      closable={false}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="pfNumber" label="P.F. Number" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="billUnitNo" label="Bill Unit No" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="designation" label="Designation" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="division" label="Division" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="headquarters" label="Headquarters" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="railwayZone" label="Railway Zone" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="rateOfPay" label="Basic Pay" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item>
        <Form.Item name="rate" label="TA per day" rules={[{ required: true }]}><InputNumber className="w-full" /></Form.Item>
      </Form>
    </Modal>
  );
};

export default ProfileModal