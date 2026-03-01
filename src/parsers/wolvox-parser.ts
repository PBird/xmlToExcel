import { XMLParser } from 'fast-xml-parser';

/**
 * Wolvox stok giriş ürün bilgisi interface
 */
export interface WolvoxProduct {
  sira: number;
  faturaNo: string;
  tarih: string;
  urunBarkodu: string;
  stokAdi: string;
  stokKodu: string;
  urunMiktari: number;
  urunBirimi: string;
  birimFiyat: number;
  malHizmetTutari: number;
  kdvOrani: number;
  lot: string;
}

/**
 * Wolvox stok giriş başlık bilgisi interface
 */
export interface WolvoxHeader {
  faturaNo: string;
  tarih: string;
  saat: string;
  unvan: string;
  vknTckn: string;
  genelToplam: number;
  doviz: string;
}

/**
 * Wolvox stok giriş parse sonucu interface
 */
export interface WolvoxParseResult {
  header: WolvoxHeader;
  products: WolvoxProduct[];
}

/**
 * Türkçe karakter dönüşümü yapar (İ→I, Ş→S, Ç→C, Ö→O, Ü→U, Ğ→G)
 * @param text - Dönüştürülecek metin
 * @returns Dönüştürülmüş metin
 */
export function normalizeTurkishChars(text: string): string {
  const turkishMap: Record<string, string> = {
    'İ': 'I',
    'Ş': 'S',
    'Ç': 'C',
    'Ö': 'O',
    'Ü': 'U',
    'Ğ': 'G',
    'ı': 'i',
    'ş': 's',
    'ç': 'c',
    'ö': 'o',
    'ü': 'u',
    'ğ': 'g'
  };

  return text.split('').map(char => turkishMap[char] || char).join('');
}

/**
 * Metni büyük harfe çevirir ve Türkçe karakterleri normalize eder
 * @param text - Dönüştürülecek metin
 * @returns Büyük harf ve normalize edilmiş metin
 */
export function toUpperAndNormalize(text: string): string {
  return normalizeTurkishChars(text.toUpperCase());
}

/**
 * XML UnitCode değerini Excel'deki Türkçe birim değerine dönüştürür
 * @param unitCode - XML UnitCode değeri
 * @returns Türkçe birim değeri
 */
export function unitCodeToTurkish(unitCode: string): string {
  const unitMap: Record<string, string> = {
    'NIU': 'ADET',
    'C62': 'ADET',
    'C262': 'ADET',
    'BX': 'KUTU',
    'PA': 'KUTU'
  };

  return unitMap[unitCode] || unitCode;
}

/**
 * UBL XML içeriğini Wolvox stok giriş verisine dönüştürür
 * @param xmlContent - UBL e-Fatura XML içeriği
 * @returns Parse edilmiş Wolvox stok giriş verisi
 */
export function parseWolvoxXml(xmlContent: string): WolvoxParseResult {
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
    throw new Error('Geçersiz UBL fatura XML formatı: Invoice elementi bulunamadı');
  }

  const header = extractWolvoxHeader(invoice);
  const products = extractWolvoxProducts(invoice);

  return { header, products };
}

/**
 * Fatura başlık bilgilerini Wolvox formatında çıkarır
 * @param invoice - Invoice objesi
 * @returns Wolvox başlık bilgisi
 */
function extractWolvoxHeader(invoice: any): WolvoxHeader {
  const invoiceInfo = invoice.InvoiceInfo || {};
  const receipentInfo = invoice.ReceipentInfo || {};
  const invoiceTotals = invoice.InvoiceTotals || {};

  const vknTckn = receipentInfo.Identifications?.Identification?.[0]?.Value || '';
  const unvan = receipentInfo.PartyName || '';
  const currency = invoiceInfo.Currency?.Value || 'TRY';

  return {
    faturaNo: invoiceInfo.InvoiceID || '',
    tarih: invoiceInfo.IssueDate || '',
    saat: invoiceInfo.IssueTime || '',
    unvan,
    vknTckn,
    genelToplam: parseFloat(invoiceTotals.TaxInclusiveAmount?.Amount || '0'),
    doviz: currency
  };
}

/**
 * Barkod ve LOT bilgisini AdditionalItemIdentification alanından çıkarır
 * @param additionalItemIdentification - AdditionalItemIdentification alanı
 * @returns { barkod, lot }
 *
 * Format: (UNO)8961101489472(LNO)300625(SNO)300625(URT)250630
 * Barkod: (UNO) ve (LNO) arasında
 * LOT: (LNO) ve (SNO) arasında
 */
function extractBarcodeAndLot(additionalItemIdentification: any): { barkod: string; lot: string } {
  let barkod = '';
  let lot = '';

  if (additionalItemIdentification && typeof additionalItemIdentification === 'string') {
    // Barkod: (UNO) ve (LNO) arasında
    const barkodMatch = additionalItemIdentification.match(/\(UNO\)(.*?)\(LNO\)/);
    if (barkodMatch && barkodMatch[1]) {
      barkod = barkodMatch[1].trim();
    }

    // LOT: (LNO) ve (SNO) arasında
    const lotMatch = additionalItemIdentification.match(/\(LNO\)(.*?)\(SNO\)/);
    if (lotMatch && lotMatch[1]) {
      lot = lotMatch[1].trim();
    }
  }

  return { barkod, lot };
}

/**
 * KDV oranını tax alanından çıkarır
 * @param taxSubTotals - TaxSubTotals objesi
 * @returns KDV oranı
 */
function extractKdvRate(taxSubTotals: any): number {
  return parseFloat(taxSubTotals.Percent || '0');
}

/**
 * Wolvox ürün satırlarını çıkarır
 * @param invoice - Invoice objesi
 * @returns Ürün listesi
 */
function extractWolvoxProducts(invoice: any): WolvoxProduct[] {
  const invoiceLines = invoice.InvoiceLines?.Line || [];
  const invoiceInfo = invoice.InvoiceInfo || {};
  const faturaNo = invoiceInfo.InvoiceID || '';
  const tarih = invoiceInfo.IssueDate || '';

  const linesArray = Array.isArray(invoiceLines) ? invoiceLines : [invoiceLines];

  return linesArray.map((line: any, index: number) => extractWolvoxProductLine(line, faturaNo, tarih, index + 1));
}

/**
 * Tek Wolvox ürün satırını çıkarır
 * @param line - Line objesi
 * @param faturaNo - Fatura numarası
 * @param tarih - Fatura tarihi
 * @param sira - Satır sırası
 * @returns Wolvox ürün bilgisi
 */
function extractWolvoxProductLine(line: any, faturaNo: string, tarih: string, sira: number): WolvoxProduct {
  const item = line.Item || {};
  const invoicedQuantity = line.InvoicedQuantity || {};
  const price = line.Price || {};
  const lineExtensionAmount = line.LineExtensionAmount || {};
  const taxTotal = line.TaxTotal || {};
  const taxSubTotals = taxTotal.TaxSubTotals || {};

  const { barkod, lot } = extractBarcodeAndLot(item.AdditionalItemIdentification);
  const stokAdi = toUpperAndNormalize(item.Name || '');
  const stokKodu = item.SellersItemIdentification || '';
  const urunMiktari = parseFloat(invoicedQuantity.Quantity || '0');
  const rawUnitCode = invoicedQuantity.UnitCode || '';
  const urunBirimi = unitCodeToTurkish(rawUnitCode);
  const birimFiyat = parseFloat(price.Amount || '0');
  const malHizmetTutari = parseFloat(lineExtensionAmount.Amount || '0');
  const kdvOrani = extractKdvRate(taxSubTotals);

  return {
    sira,
    faturaNo,
    tarih,
    urunBarkodu: barkod,
    stokAdi,
    stokKodu,
    urunMiktari,
    urunBirimi,
    birimFiyat,
    malHizmetTutari,
    kdvOrani,
    lot
  };
}

/**
 * Wolvox Excel başlık satırını oluşturur (A-T sütunları)
 * @returns Excel başlık array'i
 */
export function getWolvoxExcelHeaders(): string[] {
  return [
    'Sıra', // A
    'Fatura no', // B
    'Tarih', // C
    'Ürün Barkodu', // D
    'Stok Adı', // E
    'Stok Kodu', // F
    'Ürün Miktarı', // G
    'Ürün Birimi', // H
    'Birim Fiyatı', // I
    'Mal Hizmet Tutarı', // J
    '', // K
    'Marka', // L
    'Ürün Durumu', // M
    'KDV Oranı', // N
    'LOT', // O
    'İZLEME TİPİ', // P
    '', // Q
    '', // R
    '', // S
    'Varsayılan Depo' // T
  ];
}

/**
 * Wolvox ürünlerini Excel satır formatına dönüştürür (A-T sütunları)
 * @param product - Wolvox ürün bilgisi
 * @returns Excel satır array'i
 */
export function wolvoxProductToExcelRow(product: WolvoxProduct): any[] {
  return [
    product.sira, // A: Sıra
    product.faturaNo, // B: Fatura no
    product.tarih, // C: Tarih
    product.urunBarkodu, // D: Ürün Barkodu
    product.stokAdi, // E: Stok Adı (BÜYÜK HARF, TR dönüşümlü)
    product.stokKodu, // F: Stok Kodu
    product.urunMiktari, // G: Ürün Miktarı
    product.urunBirimi, // H: Ürün Birimi
    product.birimFiyat, // I: Birim Fiyatı
    product.malHizmetTutari, // J: Mal Hizmet Tutarı
    '', // K
    '', // L: Marka (boş)
    1, // M: Ürün Durumu (1)
    product.kdvOrani, // N: KDV Oranı
    product.lot, // O: LOT
    '', // P: İZLEME TİPİ
    '', // Q
    '', // R
    '', // S
    'MDEPO' // T: Varsayılan Depo
  ];
}

/**
 * Wolvox başlık bilgilerini Excel satırları olarak döner
 * @param header - Wolvox başlık bilgisi
 * @returns Excel satır array'leri
 */
export function wolvoxHeaderDetailsToExcelRows(header: WolvoxHeader): any[][] {
  return [
    ['FATURA NO:', header.faturaNo, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['TARİH:', header.tarih, '', 'SAAT:', header.saat, '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['ÜNVAN:', header.unvan, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['VKN/TCKN:', header.vknTckn, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['GENEL TOPLAM:', header.genelToplam, header.doviz, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  ];
}
