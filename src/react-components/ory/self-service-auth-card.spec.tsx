import React from "react"
import { expect, test } from "@playwright/experimental-ct-react"
import { SelfServiceAuthCard } from "./self-service-auth-card"
import { SelfServiceFlow } from "../../types"
import { Locator } from "playwright-core"

const defaultFlow: SelfServiceFlow = {
  id: "",
  state: "choose_method",
  type: "browser",
  ui: {
    action: "https://test.com",
    method: "POST",
    nodes: [
      {
        group: "default",
        attributes: {
          name: "id",
          type: "text",
          node_type: "input",
          disabled: false,
          required: true,
        },
        messages: [],
        type: "input",
        meta: {
          label: {
            id: 1,
            text: "ID",
            type: "text",
          },
        },
      },
      {
        group: "default",
        attributes: {
          name: "csrf_token",
          type: "hidden",
          node_type: "input",
          disabled: false,
        },
        messages: [],
        type: "input",
        meta: {},
      },
      {
        group: "password",
        attributes: {
          name: "password",
          type: "password",
          node_type: "input",
          disabled: false,
          required: true,
        },
        messages: [],
        type: "input",
        meta: {
          label: {
            id: 1,
            text: "Password",
            type: "text",
          },
        },
      },
      {
        group: "password",
        attributes: {
          name: "submit",
          type: "submit",
          node_type: "input",
          disabled: false,
        },
        messages: [],
        type: "input",
        meta: {
          label: {
            id: 1,
            text: "Submit",
            type: "text",
          },
        },
      },
    ],
  },
}

const alternativeFlow: SelfServiceFlow = {
  id: "",
  state: "choose_method",
  type: "browser",
  ui: {
    action: "https://test.com",
    method: "POST",
    nodes: [
      {
        type: "input",
        group: "default",
        attributes: {
          name: "csrf_token",
          type: "hidden",
          value: "",
          required: true,
          disabled: false,
          node_type: "input",
        },
        messages: [],
        meta: {},
      },
      {
        type: "input",
        group: "link",
        attributes: {
          name: "email",
          type: "email",
          required: true,
          disabled: false,
          node_type: "input",
        },
        messages: [],
        meta: {
          label: {
            id: 1070007,
            text: "Email",
            type: "info",
          },
        },
      },
      {
        type: "input",
        group: "link",
        attributes: {
          name: "method",
          type: "submit",
          value: "link",
          disabled: false,
          node_type: "input",
        },
        messages: [],
        meta: {
          label: {
            id: 1070005,
            text: "Submit",
            type: "info",
          },
        },
      },
    ],
  },
}

const expectDefaultFlow = async (component: Locator) => {
  await expect(component).toContainText("ID *")
  await expect(component).toContainText("Password *")
  await expect(component.locator('input[name="id"]')).toBeVisible()
  await expect(component.locator('input[name="password"]')).toBeVisible()
  await expect(component.locator('input[name="csrf_token"]')).toBeHidden()
  await expect(component.locator('button[name="submit"]')).toBeVisible()
  await expect(component.locator('button[name="submit"]')).toHaveText("Submit")
  await expect(
    component.locator('form[action="https://test.com"]'),
  ).toBeVisible()
}

const expectAlternativeFlow = async (component: Locator) => {
  await expect(component).toContainText("Email *")
  await expect(component.locator('button[type="submit"]')).toBeVisible()
  await expect(component.locator('button[type="submit"]')).toContainText(
    "Submit",
  )
}

test("ory auth card login flow", async ({ mount }) => {
  const component = await mount(
    <SelfServiceAuthCard
      title={"Sign in"}
      flowType={"login"}
      additionalProps={{
        forgotPasswordURL: "/forgot",
        signupURL: "/signup",
      }}
      flow={defaultFlow}
    />,
  )
  await expect(component).toContainText("Sign in")
  await expect(component).toContainText("Forgot password?", {
    ignoreCase: true,
  })
  await expect(
    component.locator('a[data-testid="forgot-password-link"]'),
  ).toHaveAttribute("href", "/forgot")
  await expect(
    component.locator('a[data-testid="signup-link"]'),
  ).toHaveAttribute("href", "/signup")
  await expect(component).toContainText("Don't have an account", {
    ignoreCase: true,
  })

  await expectDefaultFlow(component)
})

test("ory auth card registration flow", async ({ mount }) => {
  const component = await mount(
    <SelfServiceAuthCard
      title="Sign up"
      flowType="registration"
      additionalProps={{
        loginURL: "/login",
      }}
      flow={defaultFlow}
    />,
  )

  await expect(component).toContainText("Sign up", { ignoreCase: true })
  await expect(component).toContainText("Already have an account?", {
    ignoreCase: true,
  })
  await expect(
    component.locator('a[data-testid="login-link"]'),
  ).toHaveAttribute("href", "/login")

  await expectDefaultFlow(component)
})

test("ory auth card verification flow", async ({ mount }) => {
  const component = await mount(
    <SelfServiceAuthCard
      flow={alternativeFlow}
      flowType={"verification"}
      additionalProps={{
        signupURL: "/signup",
      }}
      title={"Verification"}
    />,
  )

  await expect(component).toContainText("Verification")
  await expect(component.locator('a[href="/signup"]')).toBeVisible()
  await expectAlternativeFlow(component)
})

test("ory auth card recovery flow", async ({ mount }) => {
  const component = await mount(
    <SelfServiceAuthCard
      flow={alternativeFlow}
      flowType={"recovery"}
      additionalProps={{
        loginURL: "/login",
      }}
      title={"Recovery"}
    />,
  )
  await expect(component).toContainText("Recovery")
  await expect(component.locator('a[href="/login"]')).toBeVisible()

  await expectAlternativeFlow(component)
})

test("ory auth card login 2fa flow", async ({ mount }) => {
  const component = await mount(
    <SelfServiceAuthCard
      flow={{
        id: "",
        type: "browser",
        request_url: "http://test.com/self-service/login/browser?aal=aal2",
        state: "choose_method",

        ui: {
          action:
            "https://test.com/self-service/login?flow=0e21a525-6aa7-40e2-8dbf-5fa51f292dc1",
          method: "POST",
          nodes: [
            {
              type: "input",
              group: "default",
              attributes: {
                name: "csrf_token",
                type: "hidden",
                value: "",
                required: true,
                disabled: false,
                node_type: "input",
              },
              messages: [],
              meta: {},
            },
            {
              type: "input",
              group: "default",
              attributes: {
                name: "identifier",
                type: "hidden",
                value: "",
                disabled: false,
                node_type: "input",
              },
              messages: [],
              meta: {},
            },
            {
              type: "input",
              group: "webauthn",
              attributes: {
                name: "webauthn_login_trigger",
                type: "button",
                value: "",
                disabled: false,
                onclick:
                  'window.__oryWebAuthnLogin({"publicKey":{"challenge":"=","timeout":60000,"rpId":"test.com","allowCredentials":[{"type":"public-key","id":""}],"userVerification":"discouraged"}})',
                node_type: "input",
              },
              messages: [],
              meta: {
                label: {
                  id: 1010008,
                  text: "Use security key",
                  type: "info",
                },
              },
            },
            {
              type: "input",
              group: "webauthn",
              attributes: {
                name: "webauthn_login",
                type: "hidden",
                value: "",
                disabled: false,
                node_type: "input",
              },
              messages: [],
              meta: {},
            },
            {
              type: "script",
              group: "webauthn",
              attributes: {
                src: "https://test.com/.well-known/ory/webauthn.js",
                async: true,
                referrerpolicy: "no-referrer",
                crossorigin: "anonymous",
                integrity:
                  "sha512-E3ctShTQEYTkfWrjztRCbP77lN7L0jJC2IOd6j8vqUKslvqhX/Ho3QxlQJIeTI78krzAWUQlDXd9JQ0PZlKhzQ==",
                type: "text/javascript",
                id: "webauthn_script",
                nonce: "6d2cacc8-9abd-4f8f-b2b9-cd5250bfa677",
                node_type: "script",
              },
              messages: [],
              meta: {},
            },
            {
              type: "input",
              group: "totp",
              attributes: {
                name: "totp_code",
                type: "text",
                value: "",
                required: true,
                disabled: false,
                node_type: "input",
              },
              messages: [],
              meta: {
                label: {
                  id: 1010006,
                  text: "Authentication code",
                  type: "info",
                  context: {},
                },
              },
            },
            {
              type: "input",
              group: "totp",
              attributes: {
                name: "method",
                type: "submit",
                value: "totp",
                disabled: false,
                node_type: "input",
              },
              messages: [],
              meta: {
                label: {
                  id: 1010009,
                  text: "Use Authenticator",
                  type: "info",
                  context: {},
                },
              },
            },
          ],
          messages: [
            {
              id: 1010004,
              text: "Please complete the second authentication challenge.",
              type: "info",
              context: {},
            },
          ],
        },
        created_at: "2022-08-22T22:02:15.825471Z",
        updated_at: "2022-08-22T22:02:15.825471Z",
        refresh: false,
        requested_aal: "aal2",
      }}
      flowType={"login"}
      additionalProps={{
        logoutURL: "/logout",
      }}
      title={"Two-factor authentication"}
    />,
  )

  expect(component).toContainText("Two-factor authentication")
  expect(component.locator("input[name='totp_code']")).toBeVisible()
  expect(component.locator('button[type="submit"]')).toBeVisible()
  expect(component.locator('a[href="/logout"]')).toBeVisible()
  expect(
    component.locator('button[name="webauthn_login_trigger"]'),
  ).toBeVisible()
})