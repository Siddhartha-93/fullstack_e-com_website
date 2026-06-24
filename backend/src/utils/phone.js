import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone is required')
  }
  const defaultCountry = process.env.PHONE_DEFAULT_COUNTRY || undefined
  const pn = parsePhoneNumberFromString(phone, defaultCountry)
  if (!pn || !pn.isValid()) {
    throw new Error('Invalid phone number')
  }
  return pn.format('E.164')
}

export function tryNormalizePhone(phone) {
  try {
    return normalizePhone(phone)
  } catch (e) {
    return null
  }
}
