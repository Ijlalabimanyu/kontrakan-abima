
-- =========================================================
-- PHASE 6.1 - SETTINGS MANAGEMENT
-- Kontrakan Abima
-- =========================================================

-- ---------------------------------------------------------
-- 1. OWNER SETTINGS
-- Satu pengaturan untuk setiap pemilik.
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.owner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profil pemilik
  owner_name VARCHAR(100) NULL,
  contact_phone VARCHAR(30) NULL,

  -- Informasi kontrakan
  business_name VARCHAR(150) NULL,
  business_address TEXT NULL,
  business_description TEXT NULL,

  -- Preferensi aplikasi
  currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
  date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT owner_settings_owner_unique
    UNIQUE (owner_id),

  CONSTRAINT owner_settings_currency_check
    CHECK (currency IN ('IDR')),

  CONSTRAINT owner_settings_timezone_check
    CHECK (
      timezone IN (
        'Asia/Jakarta',
        'Asia/Makassar',
        'Asia/Jayapura'
      )
    ),

  CONSTRAINT owner_settings_date_format_check
    CHECK (
      date_format IN (
        'DD/MM/YYYY',
        'MM/DD/YYYY',
        'YYYY-MM-DD'
      )
    ),

  CONSTRAINT owner_settings_name_length_check
    CHECK (
      owner_name IS NULL
      OR CHAR_LENGTH(owner_name) <= 100
    ),

  CONSTRAINT owner_settings_phone_length_check
    CHECK (
      contact_phone IS NULL
      OR CHAR_LENGTH(contact_phone) <= 30
    )
);

-- ---------------------------------------------------------
-- 2. PAYMENT ACCOUNTS
-- Satu pemilik dapat memiliki banyak rekening/QRIS.
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,

  account_type VARCHAR(20) NOT NULL,

  label VARCHAR(100) NOT NULL,

  -- Informasi rekening bank
  bank_name VARCHAR(100) NULL,
  account_name VARCHAR(150) NULL,
  account_number VARCHAR(100) NULL,

  -- Informasi QRIS
  qris_image_path TEXT NULL,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT payment_accounts_type_check
    CHECK (
      account_type IN (
        'BANK_TRANSFER',
        'QRIS'
      )
    ),

  CONSTRAINT payment_accounts_label_check
    CHECK (
      CHAR_LENGTH(TRIM(label)) BETWEEN 1 AND 100
    ),

  CONSTRAINT payment_accounts_sort_order_check
    CHECK (sort_order >= 0),

  CONSTRAINT payment_accounts_type_fields_check
    CHECK (
      (
        account_type = 'BANK_TRANSFER'
        AND bank_name IS NOT NULL
        AND account_name IS NOT NULL
        AND account_number IS NOT NULL
        AND qris_image_path IS NULL
      )
      OR
      (
        account_type = 'QRIS'
        AND bank_name IS NULL
        AND account_name IS NULL
        AND account_number IS NULL
      )
    )
);

-- ---------------------------------------------------------
-- 3. INDEXES
-- ---------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_payment_accounts_owner
  ON public.payment_accounts (owner_id);

CREATE INDEX IF NOT EXISTS idx_payment_accounts_owner_active
  ON public.payment_accounts (owner_id, is_active);

CREATE INDEX IF NOT EXISTS idx_payment_accounts_sort
  ON public.payment_accounts (owner_id, sort_order);

-- Hanya satu metode pembayaran default yang aktif
-- untuk setiap pemilik.
CREATE UNIQUE INDEX IF NOT EXISTS
  payment_accounts_one_default_per_owner
  ON public.payment_accounts (owner_id)
  WHERE is_default = TRUE AND is_active = TRUE;

-- ---------------------------------------------------------
-- 4. UPDATED_AT TRIGGERS
-- Menggunakan function yang sudah tersedia dari Phase 4.
-- ---------------------------------------------------------

DROP TRIGGER IF EXISTS set_owner_settings_updated_at
  ON public.owner_settings;

CREATE TRIGGER set_owner_settings_updated_at
  BEFORE UPDATE ON public.owner_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


DROP TRIGGER IF EXISTS set_payment_accounts_updated_at
  ON public.payment_accounts;

CREATE TRIGGER set_payment_accounts_updated_at
  BEFORE UPDATE ON public.payment_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------
-- 5. ENABLE ROW LEVEL SECURITY
-- ---------------------------------------------------------

ALTER TABLE public.owner_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- 6. OWNER SETTINGS POLICY
-- ---------------------------------------------------------

DROP POLICY IF EXISTS "Owner can manage own settings"
  ON public.owner_settings;

CREATE POLICY "Owner can manage own settings"
  ON public.owner_settings
  FOR ALL
  TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- ---------------------------------------------------------
-- 7. PAYMENT ACCOUNTS POLICY
-- ---------------------------------------------------------

DROP POLICY IF EXISTS "Owner can manage own payment accounts"
  ON public.payment_accounts;

CREATE POLICY "Owner can manage own payment accounts"
  ON public.payment_accounts
  FOR ALL
  TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- ---------------------------------------------------------
-- 8. TABLE PERMISSIONS
-- ---------------------------------------------------------

REVOKE ALL ON TABLE public.owner_settings FROM anon;
REVOKE ALL ON TABLE public.payment_accounts FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.owner_settings TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.payment_accounts TO authenticated;
