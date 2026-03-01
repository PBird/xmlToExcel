import { XMLParser } from 'fast-xml-parser';

/**
 * Fatura ürün bilgisi interface
 */
export interface FaturaProduct {
  faturaNo: string;
  faturaTarih: string;
  satirNo: number;
  urunAdi: string;
  urunKodu: string;
  saticiUrunKodu: string;
  aliciUrunKodu: string;
  miktar: number;
  birim: string;
  birimFiyat: number;
  kalemTutari: number;
  kdvOran: number;
  kdvTutari: number;
  toplamTutar: number;
  barkod: string;
  lot: string;
}

/**
 * Fatura başlık bilgisi interface
 */
export interface FaturaHeader {
  faturaNo: string;
  tarih: string;
  saat: string;
  vknTckn: string;
  unvan: string;
  adres: string;
  toplamMatrah: number;
  toplamKdv: number;
  genelToplam: number;
  doviz: string;
}

/**
 * Fatura parse sonucu interface
 */
export interface FaturaParseResult {
  header: FaturaHeader;
  products: FaturaProduct[];
}

/**
 * XML içeriğini fatura verisine dönüştürür
 * @param xmlContent - Fatura XML içeriği
 * @returns Parse edilmiş fatura verisi
 */
export function parseFaturaXml(xmlContent: string): FaturaParseResult {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    ignoreDeclaration: true,
    ignorePiTags: true,
    allowBooleanAttributes: true
  });

  const parsed = parser.parse(xmlContent);
  const invoice = parsed.Invoices?.Invoice;

  if (!invoice) {
    throw new Error('Geçersiz fatura XML formatı: Invoice elementi bulunamadı');
  }

  const header = extractHeader(invoice);
  const products = extractProducts(invoice, header.faturaNo, header.tarih, header.genelToplam);

  return { header, products };
}

/**
 * Fatura başlık bilgilerini çıkarır
 * @param invoice - Invoice objesi
 * @returns Fatura başlık bilgisi
 */
function extractHeader(invoice: any): FaturaHeader {
  const invoiceInfo = invoice.InvoiceInfo || {};
  const receipentInfo = invoice.ReceipentInfo || {};
  const invoiceTotals = invoice.InvoiceTotals || {};
  const taxes = invoice.Taxes || {};
  const currency = invoiceInfo.Currency?.Value || 'TRY';

  const vknTckn = receipentInfo.Identifications?.Identification?.[0]?.Value || '';
  const unvan = receipentInfo.PartyName || '';
  const street = receipentInfo.Address?.StreetName || '';
  const city = receipentInfo.Address?.CityName || '';

  return {
    faturaNo: invoiceInfo.InvoiceID || '',
    tarih: invoiceInfo.IssueDate || '',
    saat: invoiceInfo.IssueTime || '',
    vknTckn,
    unvan,
    adres: street ? `${city} - ${street}` : city,
    toplamMatrah: parseFloat(invoiceTotals.LineExtensionAmount?.Amount || '0'),
    toplamKdv: parseFloat(taxes.TaxAmount?.Amount || '0'),
    genelToplam: parseFloat(invoiceTotals.TaxInclusiveAmount?.Amount || '0'),
    doviz: currency
  };
}

/**
 * Barkod ve LOT bilgisini Note alanından çıkarır
 * @param note - Note alanı
 * @returns { barkod, lot }
 *
 * Barkod: 6. segment (| ile ayrılmış, index 5)
 * LOT: SERILOT= pattern içinde, eğer yoksa LOT da yoktur
 */
function extractBarcodeAndLot(note: any): { barkod: string; lot: string } {
  let barkod = '';
  let lot = '';

  if (note && typeof note === 'string') {
    const parts = note.split('|');
    // Barkod 6. bölümde (index 5)
    if (parts.length > 5) {
      barkod = parts[5].trim();
    }
    // LOT bilgisi SERILOT= değerinde
    const serilotMatch = note.match(/SERILOT=([^,]+)/);
    if (serilotMatch && serilotMatch[1]) {
      lot = serilotMatch[1].trim();
    }
  }

  return { barkod, lot };
}

/**
 * Fatura ürün satırlarını çıkarır
 * @param invoice - Invoice objesi
 * @param faturaNo - Fatura numarası
 * @param faturaTarih - Fatura tarihi
 * @param genelToplam - Genel toplam
 * @returns Ürün listesi
 */
function extractProducts(invoice: any, faturaNo: string, faturaTarih: string, genelToplam: number): FaturaProduct[] {
  const invoiceLines = invoice.InvoiceLines?.Line || [];

  const linesArray = Array.isArray(invoiceLines) ? invoiceLines : [invoiceLines];

  return linesArray.map((line: any) => extractProductLine(line, faturaNo, faturaTarih, genelToplam));
}

/**
 * Tek ürün satırını çıkarır
 * @param line - Line objesi
 * @param faturaNo - Fatura numarası
 * @param faturaTarih - Fatura tarihi
 * @param genelToplam - Genel toplam
 * @returns Ürün bilgisi
 */
function extractProductLine(line: any, faturaNo: string, faturaTarih: string, genelToplam: number): FaturaProduct {
  const item = line.Item || {};
  const invoicedQuantity = line.InvoicedQuantity || {};
  const price = line.Price || {};
  const lineExtensionAmount = line.LineExtensionAmount || {};
  const taxTotal = line.TaxTotal || {};
  const taxSubTotals = taxTotal.TaxSubTotals || {};

  const { barkod, lot } = extractBarcodeAndLot(line.Note);

  return {
    faturaNo,
    faturaTarih,
    satirNo: parseInt(line.ID || '0'),
    urunAdi: item.Name || '',
    urunKodu: item.ManufacturersItemIdentification || '',
    saticiUrunKodu: item.SellersItemIdentification || '',
    aliciUrunKodu: item.BuyersItemIdentification || '',
    miktar: parseFloat(invoicedQuantity.Quantity || '0'),
    birim: invoicedQuantity.UnitCode || '',
    birimFiyat: parseFloat(price.Amount || '0'),
    kalemTutari: parseFloat(lineExtensionAmount.Amount || '0'),
    kdvOran: parseFloat(taxSubTotals.Percent || '0'),
    kdvTutari: parseFloat(taxTotal.TaxAmount?.Amount || '0'),
    toplamTutar: genelToplam,
    barkod,
    lot
  };
}

/**
 * Fatura ürünlerini Excel satır formatına dönüştürür
 * @param product - Fatura ürün bilgisi
 * @returns Excel satır array'i
 */
export function faturaProductToExcelRow(product: FaturaProduct): any[] {
  return [
    product.faturaNo,
    product.faturaTarih,
    product.satirNo,
    product.urunAdi,
    product.urunKodu,
    product.saticiUrunKodu,
    product.aliciUrunKodu,
    product.miktar,
    product.birim,
    product.birimFiyat,
    product.kalemTutari,
    product.kdvOran,
    product.kdvTutari,
    product.barkod,
    product.lot
  ];
}

/**
 * Excel başlık satırını oluşturur
 * @returns Excel başlık array'i
 */
export function getExcelHeaders(): string[] {
  return [
    'Fatura No',
    'Tarih',
    'Satır No',
    'Ürün Adı',
    'Ürün Kodu',
    'Satıcı Ürün Kodu',
    'Alıcı Ürün Kodu',
    'Miktar',
    'Birim',
    'Birim Fiyat',
    'Kalem Tutarı',
    'KDV %',
    'KDV Tutarı',
    'Barkod',
    'LOT'
  ];
}

/**
 * Fatura başlık bilgilerini Excel satırı olarak döner
 * @param header - Fatura başlık bilgisi
 * @returns Excel satır array'i
 */
export function faturaHeaderToExcelRow(header: FaturaHeader): any[] {
  return [
    'FATURA BİLGİLERİ',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ];
}

/**
 * Fatura başlık detaylarını Excel satırları olarak döner
 * @param header - Fatura başlık bilgisi
 * @returns Excel satır array'leri
 */
export function faturaHeaderDetailsToExcelRows(header: FaturaHeader): any[][] {
  return [
    ['Fatura No:', header.faturaNo, '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Tarih:', `${header.tarih} ${header.saat}`, '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['VKN/TCKN:', header.vknTckn, '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Ünvan:', header.unvan, '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Adres:', header.adres, '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Matrah:', header.toplamMatrah, header.doviz, '', '', '', '', '', '', '', '', '', '', ''],
    ['KDV:', header.toplamKdv, header.doviz, '', '', '', '', '', '', '', '', '', '', ''],
    ['GENEL TOPLAM:', header.genelToplam, header.doviz, '', '', '', '', '', '', '', '', '', '', '']
  ];
}
