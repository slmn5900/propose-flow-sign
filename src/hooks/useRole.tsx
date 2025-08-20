import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  role: 'admin' | 'manager';
  permissions: Record<string, any>;
}

export const useRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, permissions')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching user role:', error);
          // Create default admin role for first user
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'admin',
              permissions: {}
            });
          
          if (!insertError) {
            setUserRole({ role: 'admin', permissions: {} });
          }
        } else if (data) {
          setUserRole({
            role: data.role as 'admin' | 'manager',
            permissions: data.permissions as Record<string, any>
          });
        } else {
          // No role found, create default admin role
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'admin',
              permissions: {}
            });
          
          if (!insertError) {
            setUserRole({ role: 'admin', permissions: {} });
          }
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = userRole?.role === 'admin';
  const isManager = userRole?.role === 'manager';
  const hasPermission = (permission: string) => {
    return isAdmin || userRole?.permissions?.[permission] === true;
  };

  return {
    userRole,
    loading,
    isAdmin,
    isManager,
    hasPermission
  };
};