export const formatCurrency = (cents: number | undefined | null): string => {
  if (cents === undefined || cents === null) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

export const parseCurrencyToCents = (value: string): number => {
  if (!value) return 0;
  // Remove tudo que não for dígito
  const digitsOnly = value.replace(/\D/g, '');
  return parseInt(digitsOnly, 10) || 0;
};

// Formatação visual enquanto o usuário digita no input (ex: R$ 1.500,00)
export const formatCurrencyInput = (value: string): string => {
  const cents = parseCurrencyToCents(value);
  if (cents === 0) return '';
  return formatCurrency(cents);
};

export const normalizePhone = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

export const formatPhone = (value: string): string => {
  const digits = normalizePhone(value);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (_match, p1, p2, p3) => {
      let res = `(${p1}`;
      if (p2) res += `) ${p2}`;
      if (p3) res += `-${p3}`;
      return res;
    });
  }
  return digits.replace(/(\d{2})(\d{0,5})(\d{0,4})/, (_match, p1, p2, p3) => {
    let res = `(${p1}`;
    if (p2) res += `) ${p2}`;
    if (p3) res += `-${p3}`;
    return res;
  });
};

export const normalizeDocument = (value: string): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

export const formatDocument = (value: string): string => {
  const digits = normalizeDocument(value);
  if (digits.length <= 11) {
    // CPF
    return digits.replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (_match, p1, p2, p3, p4) => {
      let res = p1;
      if (p2) res += `.${p2}`;
      if (p3) res += `.${p3}`;
      if (p4) res += `-${p4}`;
      return res;
    });
  } else {
    // CNPJ
    return digits.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (_match, p1, p2, p3, p4, p5) => {
      let res = p1;
      if (p2) res += `.${p2}`;
      if (p3) res += `.${p3}`;
      if (p4) res += `/${p4}`;
      if (p5) res += `-${p5}`;
      return res;
    });
  }
};

