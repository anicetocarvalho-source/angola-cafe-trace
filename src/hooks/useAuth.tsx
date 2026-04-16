import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export interface UserRole {
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const navigate = useNavigate();

  const fetchRoles = async (userId: string) => {
    setRolesLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles(data || []);
    setRolesLoading(false);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(() => fetchRoles(session.user.id), 0);
        } else {
          setRoles([]);
          setRolesLoading(false);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchRoles(session.user.id);
      } else {
        setRolesLoading(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    navigate("/auth");
  };

  const hasRole = (role: string) => {
    return roles.some((r) => r.role === role);
  };

  return {
    user,
    session,
    loading,
    roles,
    hasRole,
    signOut,
  };
}
