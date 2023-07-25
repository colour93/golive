import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity()
export class OTP {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email: string

    @Column()
    code: string

    @Column({ default: 0 })
    used: number

    @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
    created: Date
    
}
