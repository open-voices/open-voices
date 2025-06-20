import { auth } from "./lib/auth";
import { PRISMA } from "./lib/prisma";

/**
 * This function sets up the default configuration for the application.
 *
 * As this is a non-interactive setup function, it does not take any parameters except for the environment variables.
 */
export async function setup(): Promise<void> {
  console.log(`[ ] Checking setup requirements...`);

  const installation_settings = await PRISMA.installationSettings.findUnique({
    where: {
      name: `IS_FIRST_SETUP_COMPLETED`,
    },
  });

  if (installation_settings && installation_settings.value === true) {
    console.warn(`[!] Installation settings already exist. Skipping setup.`);
    return;
  }

  if (!process.env.DEFAULT_ADMIN_EMAIL) {
    throw new Error(`DEFAULT_ADMIN_EMAIL environment variable is not set.`);
  }
  if (!process.env.DEFAULT_ADMIN_PASSWORD) {
    throw new Error(`DEFAULT_ADMIN_PASSWORD environment variable is not set.`);
  }
  const admin_name = process.env.DEFAULT_ADMIN_NAME ?? `Admin`;

  console.log(
    `[ ] Creating default admin user with email: ${process.env.DEFAULT_ADMIN_EMAIL} and name: ${admin_name}`
  );

  const user = await auth.api.createUser({
    body: {
      name: admin_name,
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: process.env.DEFAULT_ADMIN_PASSWORD,
      role: `admin`,
    },
  });
  console.warn(`[+] Default admin user created, id: ${user.user.id}`);

  await PRISMA.user.update({
    where: {
      id: user.user.id,
    },
    data: {
      emailVerified: true,
    },
  });
  console.log(`[+] Default admin user email verified`);

  await PRISMA.installationSettings.create({
    data: {
      name: `IS_FIRST_SETUP_COMPLETED`,
      value: true,
    },
  });
  console.log(`[+] Setup completed successfully.`);
}
