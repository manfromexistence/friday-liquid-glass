import { SignUp } from "components/auth/sign-up";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create Your Account",
};

export default function SignInPage() {
    return <SignUp />;
}
