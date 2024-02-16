export enum ClinicCommand {
  CLINIC_CREATE = 'CLINIC_CREATE',
  CLINIC_LIST = 'CLINIC_LIST',
  UPDATE_CLINIC = 'UPDATE_CLINIC',
  ADD_USER_TO_CLINIC = 'ADD_USER_TO_CLINIC',
  SUBSCRIBE_PLAN = 'SUBSCRIBE_PLAN',
  UPDATE_USER = 'update_user',
  GET_USERS_BY_CLINIC = 'GET_USERS_BY_CLINIC',
  UPDATE_SUBSCRIBE_PLAN = 'UPDATE_SUBSCRIBE_PLAN',
  GET_PERMISSIONS = 'GET_PERMISSIONS',
  CREATE_USER_GROUP_ROLE = 'CREATE_USER_GROUP_ROLE',
  DELETE_USER_GROUP_ROLE = 'DELETE_USER_GROUP_ROLE',
  UPDATE_USER_GROUP_ROLE = 'UPDATE_USER_GROUP_ROLE',
  GET_USER_GROUP_ROLE = 'GET_USER_GROUP_ROLE',
  GET_CLINIC_DETAIL = 'GET_CLINIC_DETAIL',
  GET_SUBSCRIBE_PLAN = 'GET_SUBSCRIBE_PLAN',
  CREATE_CLINIC_SERVICE = 'CREATE_CLINIC_SERVICE',
  UPDATE_CLINIC_SERVICE = 'UPDATE_CLINIC_SERVICE',
  GET_CLINIC_SERVICE_BY_ID = 'GET_CLINIC_SERVICE_BY_ID',
  GET_CLINIC_SERVICE_BY_CLINIC_ID = 'GET_CLINIC_SERVICE_BY_CLINIC_ID',
  DELETE_CLINIC_SERVICE = 'DELETE_CLINIC_SERVICE',
  GET_APPOINMENTS = 'GET_APPOINMENTS',
  FIND_ALL_STAFF_IN_CLINIC = 'FIND_ALL_STAFF_IN_CLINIC',
  CREATE_APPOINMENT = 'CREATE_APPOINMENT',
  GET_APPOINMENT_BY_ID = 'GET_APPOINMENT_BY_ID',
  UPDATE_APPOINMENT = 'UPDATE_APPOINMENT',
  CREATE_CATEGORY = 'CREATE_CATEGORY',
  UPDATE_CATEGORY = 'UPDATE_CATEGORY',
  FIND_CATEGORY_BY_ID = 'FIND_CATEGORY_BY_ID',
  DELETE_CATEGORY = 'DELETE_CATEGORY',
  SEARCH_CATEGORY = 'SEARCH_CATEGORY',
  CREATE_NEWS = 'CREATE_NEWS',
  FIND_NEWS_BY_ID = 'FIND_NEWS_BY_ID',
  UPDATE_NEWS = 'UPDATE_NEWS',
  DELETE_NEWS = 'DELETE_NEWS',
  SEARCH_NEWS = 'SEARCH_NEWS',
}
export enum MedicalSupplierCommand {
  MEDICAL_SUPPLIER_CREATE = 'MEDICAL_SUPPLIER_CREATE',
  MEDICAL_SUPPLIER_LIST = 'MEDICAL_SUPPLIER_LIST',
  MEDICAL_SUPPLIER_UPDATE = 'MEDICAL_SUPPLIER_UPDATE',
  MEDICAL_SUPPLIER_DELETE = 'MEDICAL_SUPPLIER_DELETE',
  MEDICAL_SUPPLIER_GET = 'MEDICAL_SUPPLIER_GET',
}

export enum PatientCommand {
  SEARCH_PATIENT = 'SEARCH_PATIENT',
  CREATE_PATIENT = 'CREATE_PATIENT',
  UPDATE_PATIENT = 'UPDATE_PATIENT',
  GET_PATIENT_BY_ID = 'GET_PATIENT_BY_ID',
  DELETE_PATIENT = 'DELETE_PATIENT',
}

export enum AuthCommand {
  USER_CREATE = 'user_create',
  GET_USER_TOKEN = 'get_user_token',
}

export enum PatientReceptionCommand {
  CREATE_PATIENT_RECEPTION = 'CREATE_PATIENT_RECEPTION',
  UPDATE_PATIENT_RECEPTION = 'UPDATE_PATIENT_RECEPTION',
  GET_MEDICAL_RECORD = 'GET_MEDICAL_RECORD',
  GET_LIST_MEDICAL_RECORD = 'GET_LIST_MEDICAL_RECORD',
  UPDATE_MEDICAL_RECORD_SERVICE = 'UPDATE_MEDICAL_RECORD_SERVICE',
  REQUEST_SERVICE = 'REQUEST_SERVICE',
  GET_REQUEST_SERVICE_BY_CODE = 'GET_REQUEST_SERVICE_BY_CODE',
  CREATE_PATIENT_RECEPTION_2 = 'CREATE_PATIENT_RECEPTION_2',
  UPDATE_MEDICAL_RECORD_PRESCRIPTION = 'UPDATE_MEDICAL_RECORD_PRESCRIPTION',
  EXPORT_INVOICE = 'EXPORT_INVOICE',
  UPDATE_REQUEST_SERVICE = 'UPDATE_REQUEST_SERVICE',
  CREATE_MEDICAL_RECORD_SERVICE = 'CREATE_MEDICAL_RECORD_SERVICE',
  DELETE_MEDICAL_RECORD_SERVICE = 'DELETE_MEDICAL_RECORD_SERVICE',
}

export enum ClinicStatiticsCommand {
  GET_CLINIC_STATITICS = 'get-clinic-statitics',
}
