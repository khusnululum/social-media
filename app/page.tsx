import LoginPage from "./login/page";
import RegisterPage from "./register/page";

export default function Home() {
  return (
    <main>
      <section id="login">
        <LoginPage />
      </section>
      <section id="register">
        <RegisterPage />
      </section>
    </main>
  );
}
