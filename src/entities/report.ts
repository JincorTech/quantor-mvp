import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';


@Entity()
export class Report {
    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    user: string;

    @Column()
    timestamp: number;

    @Column()
    hash: string;

    @Column()
    fileUrl: string;

    @Column()
    status: string;

    constructor(user: string, timestamp: number, hash: string, fileUrl: string) {
        this.user = user;
        this.timestamp = timestamp;
        this.hash = hash;
        this.fileUrl = fileUrl;
    }

}