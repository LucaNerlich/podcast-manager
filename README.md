# podcast-manager
CMS for RSS Feeds + Markdown Blog Content + Client Implementation

## Local Setup

1. `CREATE DATABASE podcastmanager;`
2. `CREATE ROLE podcastmanager_user WITH LOGIN PASSWORD 'changeme' CREATEDB;`
3. `\du` -> display info
4. `GRANT ALL PRIVILEGES ON DATABASE podcastmanager TO podcastmanager_user;`
5. `ALTER USER podcastmanager_user WITH SUPERUSER;`

## AWS S3

Bucket ACL

![img.png](./assets/img.png)

![img_1.png](./assets/img_1.png)

Bucket Policy

```json
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::podcast-manager/*"
        }
    ]
}
```

Bucket CORS

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "https://podcastmanager.lucanerlich.com"
        ],
        "ExposeHeaders": []
    }
]
```
