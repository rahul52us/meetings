import { loginValidation, registerValidation, changePasswordValidation } from './authenticate.validation';

let email = 'your@example.com'
let password = 'abc123456'

describe('LoginValidation', () => {
    it('should validate if email is email and password is minimum 6 character', () => {
        const validateResult = loginValidation({ email, password });
        expect(validateResult).toBe(true);
    })

    it('should invalidate if email is not email', () => {
        const validateResult = loginValidation({ email:'sjjhsjjsdf', password });
        expect(Array.isArray(validateResult)).toBe(true);
    })

    it('should invalidate if password is less than 6', () => {
        const validateResult = loginValidation({ email, password:'abc23' });
        expect(Array.isArray(validateResult)).toBe(true);
    })
})

describe('change password validation', () => {
    it('should check if password is a string and a minimum 6 characters', () => {
        const validateResult = changePasswordValidation({password})
        expect(validateResult).toBe(true);
    })

    it('should check if password is not empty', () => {
        const validateResult = changePasswordValidation({password:""})
        expect(Array.isArray(validateResult)).toBe(true);
    })
})

describe('register validation', () => {
    it('email should be email, password should be min 6 char and name should be string', () => {
        const validateResult = registerValidation({email, password, name:'abc1234'})
        expect(validateResult).toBe(true);
    })

    it('should check if name is not empty', () => {
        const validateResult = registerValidation({email, password, name:''})
        expect(Array.isArray(validateResult)).toBe(true);
    })
})
