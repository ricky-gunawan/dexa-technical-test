## Folder structure

Di repository ini terdapat 3 aplikasi: backend, frontend absensi (untuk karyawan), dan frontend monitoring (Admin HRD). Dengan struktur folder sebagai berikut:

```
.
├── backend
│   └── src/
├── fe-absensi
│   └── src/
├── fe-monitoring
│   └── src/
└── README.md
```

## Architecture Diagram

```mermaid
flowchart LR
    Karyawan
    Admin["Admin (HRD)"]

    subgraph System
      FE-Absensi
      FE-Monitoring
      Backend["Backend Api"]
      DB["DB (PostgreSQL)"]
      DB-log["Logging DB (PostgreSQL)"]
      Redis["Redis (Pub-Sub)"]
    end

    Karyawan <--> FE-Absensi
    Admin <--> FE-Monitoring
    FE-Absensi <--> |"Rest API"| Backend
    FE-Monitoring <--> |"Rest API"| Backend
    Backend <--> DB
    Backend <--> Redis
    Redis --> DB-log
    Redis --> |"Popup/alert (using SSE)"| FE-Monitoring
```

Tech stack: Typescript, React.js, Tailwind CSS, NestJS, PostgreSQL, SSE (untuk popup/alert di halaman admin), dan Redis (untuk Pub-Sub).

Notes:

- Untuk popup/alert sebenarnya bisa memakai firebase atau websocket. Akan tetapi saya rasa SSE lebih simple dan lebih cocok dan cukup menjawab kebutuhan

- Begitu juga untuk keperluan Pub-Sub, menurut saya Kafka, RabitMQ, AWS SQS, GCP Pub-
  Sub terlalu overkill, dan membutuhkan setup yang cukup kompleks, sehingga untuk kebutuhan yang simple seperti logging dan alert saya memilih fitur Pub-Sub dari Redis. Akan tetapi di sini saya menggunakan adapter pattern sehingga mudah untuk diswap ke teknologi tersebut jika memang diperlukan

- Berdasarkan requirement, ketika ada perubahan data karyawan, data harus masuk ke message queue untuk kemudian dimasukkan ke database terpisah untuk kebutuhan logging. Untuk simplifikasi, saya tidak akan menggunakan database terpisah, melainkan hanya akan membuat table tersendiri di dalam database postgresql yang sudah ada.

## Database Design

```mermaid
erDiagram
    KARYAWAN {
        uuid id
        text name
        text email
        text photoURL
        text position
        text phone_number
        text password
    }
    ABSENSI {
        uuid id
        uuid karyawan_id
        timestamp created_at
        enum status
    }
    KARYAWAN ||--o{ ABSENSI : absen
```
