import { useState, useCallback } from 'react';

/**
 * useConfirm — Hook to replace window.confirm() with a premium dialog.
 *
 * Usage:
 *   const { confirm, ConfirmDialogProps } = useConfirm();
 *
 *   const handleDelete = async () => {
 *     const ok = await confirm({
 *       title: 'ยืนยันการลบ',
 *       message: 'คุณแน่ใจหรือไม่?',
 *       confirmLabel: 'ลบ',
 *       variant: 'danger',
 *     });
 *     if (!ok) return;
 *     // proceed with deletion...
 *   };
 *
 *   return (
 *     <>
 *       <ConfirmDialog {...ConfirmDialogProps} />
 *       ...
 *     </>
 *   );
 */
const useConfirm = () => {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'ยืนยัน',
    cancelLabel: 'ยกเลิก',
    variant: 'danger',
    resolve: null,
  });

  const confirm = useCallback(
    ({ title, message, confirmLabel, cancelLabel, variant } = {}) => {
      return new Promise((resolve) => {
        setState({
          isOpen: true,
          title: title || 'ยืนยันการดำเนินการ',
          message: message || '',
          confirmLabel: confirmLabel || 'ยืนยัน',
          cancelLabel: cancelLabel || 'ยกเลิก',
          variant: variant || 'danger',
          resolve,
        });
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state.resolve]);

  const ConfirmDialogProps = {
    isOpen: state.isOpen,
    title: state.title,
    message: state.message,
    confirmLabel: state.confirmLabel,
    cancelLabel: state.cancelLabel,
    variant: state.variant,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return { confirm, ConfirmDialogProps };
};

export default useConfirm;
