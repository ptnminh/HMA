export enum StaffCommand {
  CREATE_STAFF = 'CREATE_STAFF',
  UPDATE_STAFF = 'UPDATE_STAFF',
  DELETE_STAFF = 'DELETE_STAFF',
  FIND_STAFF_BY_ID = 'FIND_STAFF_BY_ID',
  FIND_STAFF_BY_USER_ID = 'FIND_STAFF_BY_USER_ID',
  FIND_ALL_STAFF = 'FIND_ALL_STAFF',
  CREATE_SCHEDULE = 'CREATE_SCHEDULE',
  UPDATE_SCHEDULE = 'UPDATE_SCHEDULE',
  DELETE_SCHEDULE = 'DELETE_SCHEDULE',
  FIND_SCHEDULE_BY_ID = 'FIND_SCHEDULE_BY_ID',
  FIND_SCHEDULE_BY_STAFF_ID = 'FIND_SCHEDULE_BY_STAFF_ID',
  FIND_SERVICE_BY_STAFF_ID = 'FIND_SERVICE_BY_STAFF_ID',
  UPDATE_STAFF_SERVICE = 'UPDATE_STAFF_SERVICE',
  CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
  FIND_APPOINTMENT_BY_STAFF_ID = 'FIND_APPOINTMENT_BY_STAFF_ID',
  FIND_FREE_APPOINTMENT_BY_STAFF_ID = 'FIND_FREE_APPOINTMENT_BY_STAFF_ID',
  SEARCH_STAFF = 'SEARCH_STAFF',
}

export enum AuthCommand {
  USER_CREATE = 'user_create',
  USER_GET = 'user_get',
}

export enum ClinicCommand {
  GET_CLINIC_DETAIL = 'GET_CLINIC_DETAIL',
}

export enum EVENTS {
  NOTIFICATION_CREATE = 'create_realtime_notification',
}
