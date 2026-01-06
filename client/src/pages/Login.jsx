// src/pages/Login.jsx
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from "../Context/AuthLayout";

import { useAuth } from '../Context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      
      if (response.ok) {
        // ✅ Use the login function from context - it handles everything
        login(data.token, data.user);
        
        message.success('Login Successful!');
        navigate('/');  // Navigate after state is set
      } else {
        message.error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      message.error('Connection error');
      console.error('Login error:', error.message);
    }
  };

  return (
    <AuthLayout title="Login">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item 
          name="email" 
          rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
        </Form.Item>

        <Form.Item 
          name="password" 
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large" className="bg-blue-600">
          Sign In
        </Button>

        <div className="mt-4 text-center text-gray-500">
          New user? <Link to="/register" className="text-blue-600 hover:text-blue-700">Create an account</Link>
        </div>
      </Form>
    </AuthLayout>
  );
};

export default Login;
