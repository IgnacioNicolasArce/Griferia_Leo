"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
};

export default function AdminUsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/profiles/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Error al actualizar el rol");
        return;
      }
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/profiles");
        const data = await res.json();
        setProfiles(Array.isArray(data) ? data : []);
      } catch {
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Gestión de roles (Admin / Cliente). Los perfiles se crean al registrarse con Supabase Auth.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-zinc-500">Cargando...</p>
      ) : profiles.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Users className="mx-auto h-12 w-12 text-zinc-400" />
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            No hay usuarios en la tabla profiles. Configurá Supabase Auth y un trigger para crear perfiles al registrarse.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Rol
                </th>
                <th className="px-4 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                    {profile.full_name || "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {profile.email || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={profile.role}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                      disabled={updatingId === profile.id}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 disabled:opacity-60"
                    >
                      <option value="customer">Cliente</option>
                      <option value="admin">Admin</option>
                    </select>
                    {updatingId === profile.id && (
                      <span className="ml-2 text-xs text-zinc-500">Guardando...</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {new Date(profile.created_at).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
