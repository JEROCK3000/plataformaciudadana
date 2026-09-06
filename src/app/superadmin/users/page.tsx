import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Users, Plus, Shield, Building2, Trash2 } from 'lucide-react';
import { createUser, deleteUser } from '@/lib/actions/users';

export const dynamic = 'force-dynamic';

export default async function SuperadminUsersPage() {
  const [users, tenants] = await Promise.all([
    prisma.user.findMany({
      include: { tenant: { select: { name: true, slug: true, canton: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tenant.findMany({
      where: { isActive: true },
      select: { id: true, name: true, canton: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Users className="text-purple-400" size={24} /> Usuarios Globales del SaaS
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Gestión centralizada de cuentas Superadmin y Administradores locales de cada municipio.
        </p>
      </div>

      {/* Formulario de creación */}
      <div className="bg-gray-800/80 rounded-2xl border border-gray-700/60 p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Plus size={18} className="text-purple-400" /> Crear Nuevo Usuario en la Red
        </h3>

        <form
          action={async (formData) => {
            'use server';
            await createUser(formData);
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre Completo</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Juan Pérez"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@municipio.gob.ec"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow transition-colors"
            >
              Crear Usuario
            </button>
          </div>
        </form>
      </div>

      {/* Listado de usuarios */}
      <div className="bg-gray-800/80 rounded-2xl border border-gray-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
              <tr>
                <th className="px-6 py-3.5">Nombre</th>
                <th className="px-6 py-3.5">Correo</th>
                <th className="px-6 py-3.5">Rol</th>
                <th className="px-6 py-3.5">Municipio Asignado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/40">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.role === 'SUPERADMIN'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.tenant ? (
                      <span className="flex items-center gap-1 text-xs text-gray-300">
                        <Building2 size={12} className="text-emerald-400" />
                        {u.tenant.name} (Cantón {u.tenant.canton})
                      </span>
                    ) : (
                      <span className="text-xs text-purple-400 font-semibold italic">
                        Global (Sin restricción de GAD)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.email !== 'superadmin@solinteec.com' && u.email !== 'admin@solinteec.com' && (
                      <form
                        action={async () => {
                          'use server';
                          await deleteUser(u.id);
                        }}
                        className="inline-block"
                      >
                        <button
                          type="submit"
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
