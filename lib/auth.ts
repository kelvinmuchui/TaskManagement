import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function getSession () {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();

    if (!session?.user) {
        return null;
    }

    return {
        username : (session.user as any).username,
        isAdmin : (session.user as any).isAdmin || false
    }
}
export  async function requireAuth(){
    const user = await getCurrentUser();
    if(!user){
        redirect('/login');
    }
    return user;
}
export  async function requireAdmin(){
    const user = await requireAuth();
    if(!user?.isAdmin){
        redirect('/dashboard');
    }
    return user;
}