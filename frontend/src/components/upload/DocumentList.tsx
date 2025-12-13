import React, { useState } from 'react';
import { Download, Trash2, File } from 'lucide-react';
import { Document } from '../../types';
import { formatDate, formatFileSize } from '../../utils/format';
import { documentService } from '../../services/documentService';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../common/ConfirmDialog';

// Fonction pour nettoyer les noms de fichiers mal encodés
const sanitizeFileName = (filename: string): string => {
  try {
    // Essayer de décoder les caractères UTF-8 mal encodés
    const decoded = decodeURIComponent(escape(filename));
    return decoded;
  } catch (error) {
    // Si le décodage échoue, retourner le nom original
    return filename;
  }
};

interface DocumentListProps {
  documents: Document[];
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
  canDelete = true,
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleDownload = (doc: Document) => {
    const url = documentService.getDownloadUrl(doc.id);
    window.open(url, '_blank');
  };

  const handleDelete = async (id: string) => {
    try {
      await documentService.delete(id);
      showToast('Document supprimé avec succès', 'success');
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      showToast('Erreur lors de la suppression du document', 'error');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.includes('pdf')) {
      return '📄';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return '📊';
    }
    return '📎';
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun document</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{sanitizeFileName(doc.originalName)}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>•</span>
                  <span>{formatDate(doc.uploadedAt)}</span>
                </div>
                {doc.description && (
                  <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleDownload(doc)}
                className="p-2 text-gray-600 hover:text-primary transition-colors"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </button>
              {canDelete && onDelete && (
                <button
                  onClick={() => setDeleteId(doc.id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Supprimer le document"
        message="Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </>
  );
};

export default DocumentList;

