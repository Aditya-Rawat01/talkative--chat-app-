import zod from 'zod'

export const signupSchema=zod.object({
    username:zod.string(),
    password:zod.string(),
    email:zod.string().email()
})