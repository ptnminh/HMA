export enum PaymentCommand {
    VNPAY_CREATE_ORDER = 'vnpay_create-order',
    ZALOPAY_CREATE_ORDER = 'zalopay_create-order',
    CREATE_ORDER = 'create_order',
    HANDLE_CALLBACK = 'handle_callback',
    UPDATE_CLINIC = 'UPDATE_CLINIC',
    UPDATE_SUBSCRIBE_PLAN = 'UPDATE_SUBSCRIBE_PLAN',
}