// src/pages/Registration.jsx
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

const Registration = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const url = "http://localhost:5000"

  const onFinish = async (values) => {
    try {
      const response = await fetch(`${url}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Registration Successful! Please login.');
        navigate('/login');
      } else {
        message.error(data.error || 'Registration failed');
      }
    } catch (error) {
      message.error('Server error. Please try again later.');
      console.error('Registration error:', error.message);
    }
  };

  return (
    <AuthLayout title="Create Account">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item 
          name="fullName" 
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Full Name (as per Railway records)" size="large" />
        </Form.Item>

        <Form.Item 
          name="email" 
          rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email Address" size="large" />
        </Form.Item>

        <Form.Item 
          name="password" 
          rules={[{ required: true, min: 6, message: 'Password must be 6+ characters' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large" className="bg-blue-600">
          Register
        </Button>
        
        <div className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700">Login here</Link>
        </div>
      </Form>
    </AuthLayout>
  );
};

export default Registration;
  