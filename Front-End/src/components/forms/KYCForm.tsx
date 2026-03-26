import React from 'react';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Form, Input, Select, Button, InputNumber, Row, Col } from 'antd';

const { Option } = Select;

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  occupation: Yup.string().required('Occupation is required'),
  expectedIncome: Yup.number().min(0, 'Income cannot be negative').required('Expected income is required'),
  cnic: Yup.string().required('CNIC is required').matches(/^\d{5}-\d{7}-\d{1}$/, 'Invalid CNIC format (e.g., 12345-1234567-1)'),
});

interface KYCFormProps {
  profile?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const KYCForm: React.FC<KYCFormProps> = ({ profile, onSubmit, onCancel }) => {
  const initialValues = profile || {
    name: '',
    email: '',
    occupation: '',
    expectedIncome: 0,
    cnic: '',
  };

  const handleSubmit = async (values: any, { setSubmitting }: FormikHelpers<any>) => {
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        isSubmitting,
      }) => (
        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Full Name"
                validateStatus={touched.name && errors.name ? 'error' : ''}
                help={touched.name && String(errors.name)}
              >
                <Input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter full name"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                validateStatus={touched.email && errors.email ? 'error' : ''}
                help={touched.email && String(errors.email)}
              >
                <Input
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter email"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="CNIC Number"
                validateStatus={touched.cnic && errors.cnic ? 'error' : ''}
                help={touched.cnic && String(errors.cnic)}
              >
                <Input
                  name="cnic"
                  value={values.cnic}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="12345-1234567-1"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Occupation"
                validateStatus={touched.occupation && errors.occupation ? 'error' : ''}
                help={touched.occupation && String(errors.occupation)}
              >
                <Select
                  value={values.occupation}
                  onChange={(val) => setFieldValue('occupation', val)}
                  onBlur={handleBlur}
                  placeholder="Select occupation"
                >
                  <Option value="Software Engineer">Software Engineer</Option>
                  <Option value="Business Owner">Business Owner</Option>
                  <Option value="Student">Student</Option>
                  <Option value="Housewife">Housewife</Option>
                  <Option value="Retired">Retired</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Expected Monthly Income (PKR)"
                validateStatus={touched.expectedIncome && errors.expectedIncome ? 'error' : ''}
                help={touched.expectedIncome && String(errors.expectedIncome)}
              >
                <InputNumber
                  name="expectedIncome"
                  value={values.expectedIncome}
                  onChange={(val) => setFieldValue('expectedIncome', val)}
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\D/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {profile ? 'Update Profile' : 'Create Customer'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
