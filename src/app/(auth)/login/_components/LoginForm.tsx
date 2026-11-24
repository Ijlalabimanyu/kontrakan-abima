"use client";

import { useActionState } from "react";
import { Button, Form, Input, Typography } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { signIn, type AuthActionState } from "@/services/auth/actions";

const initialState: AuthActionState = {
  error: null,
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction}>
      <Form.Item>
        <Input
          name="email"
          type="email"
          size="large"
          prefix={<MailOutlined />}
          placeholder="Email"
          autoComplete="email"
          required
        />
      </Form.Item>

      <Form.Item>
        <Input.Password
          name="password"
          size="large"
          prefix={<LockOutlined />}
          placeholder="Password"
          autoComplete="current-password"
          required
        />
      </Form.Item>

      {state.error && (
        <Typography.Text type="danger">{state.error}</Typography.Text>
      )}

      <Button
        htmlType="submit"
        type="primary"
        size="large"
        block
        loading={isPending}
        className="mt-4"
      >
        Login
      </Button>
    </form>
  );
}
