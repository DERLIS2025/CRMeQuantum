import LoginForm from './login-form';

type LoginPageProps = {
  searchParams?: Promise<{ signup?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const signupSuccess = params?.signup === 'success';

  return <LoginForm signupSuccess={signupSuccess} />;
}
