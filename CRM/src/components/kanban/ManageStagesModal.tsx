import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Modal } from '../ui/Modal';
import { Badge, type BadgeVariant } from '../ui/Badge';

interface ManageStagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageStagesModal: React.FC<ManageStagesModalProps> = ({ isOpen, onClose }) => {
  const { stages, orders, addStage, updateStage, deleteStage } = useCRM();

  const [newTitle, setNewTitle] = useState('');
  const [newVariant, setNewVariant] = useState<BadgeVariant>('indigo');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editVariant, setEditVariant] = useState<BadgeVariant>('indigo');

  const variantOptions: { value: BadgeVariant; label: string }[] = [
    { value: 'indigo', label: 'Indigo (Индиго)' },
    { value: 'amber', label: 'Amber (Янтарный)' },
    { value: 'purple', label: 'Purple (Фиолетовый)' },
    { value: 'sky', label: 'Sky (Голубой)' },
    { value: 'teal', label: 'Teal (Бирюзовый)' },
    { value: 'emerald', label: 'Emerald (Изумрудный)' },
    { value: 'rose', label: 'Rose (Розовый)' },
    { value: 'fuchsia', label: 'Fuchsia (Фуксия)' },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addStage(newTitle.trim(), newVariant);
    setNewTitle('');
  };

  const startEdit = (stg: any) => {
    setEditingId(stg.id);
    setEditTitle(stg.title);
    setEditVariant(stg.variant);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    updateStage(id, editTitle.trim(), editVariant);
    setEditingId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Настройка колонок Канбан-доски"
      subtitle="Добавляйте, переименовывайте и настраивайте этапы воронки заказов"
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Form to add a new stage */}
        <form onSubmit={handleAdd} className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
          <div className="text-xs font-black uppercase text-neutral-400">
            Добавить новую колонку (этап)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Название этапа (например: Проверка макета)..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white focus:ring-1 focus:ring-black outline-none"
              />
            </div>
            <div>
              <select
                value={newVariant}
                onChange={(e) => setNewVariant(e.target.value as BadgeVariant)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-700 outline-none"
              >
                {variantOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-neutral-400">Превью:</span>
              <Badge variant={newVariant}>{newTitle || 'Новый этап'}</Badge>
            </div>
            <button
              type="submit"
              className="bg-black hover:bg-neutral-800 text-white px-4 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить этап</span>
            </button>
          </div>
        </form>

        {/* Existing stages list */}
        <div className="space-y-2">
          <div className="text-xs font-black uppercase text-neutral-400">
            Текущие колонки на доске ({stages.length})
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {stages.map((stg, index) => {
              const ordersCount = orders.filter(o => o.stage === stg.key).length;
              const isEditing = editingId === stg.id;

              return (
                <div 
                  key={stg.id}
                  className="bg-white p-3 rounded-xl border border-neutral-200 flex items-center justify-between gap-3 shadow-2xs"
                >
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold outline-none"
                      />
                      <select
                        value={editVariant}
                        onChange={(e) => setEditVariant(e.target.value as BadgeVariant)}
                        className="px-2 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold bg-white"
                      >
                        {variantOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => saveEdit(stg.id)}
                        className="p-1.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-neutral-400 w-5">#{index + 1}</span>
                        <Badge variant={stg.variant}>{stg.title}</Badge>
                        <span className="text-[11px] font-bold text-neutral-400">
                          ({ordersCount} заказов)
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(stg)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded-lg transition cursor-pointer"
                          title="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStage(stg.id)}
                          className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                          title="Удалить этап"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="bg-black hover:bg-neutral-800 text-white px-5 py-2 text-xs font-bold rounded-lg shadow-xs cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </Modal>
  );
};
