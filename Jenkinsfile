pipeline {
    agent any

    stages {
        stage('Stop old containers') {
            steps {
                sh 'docker-compose -f docker-compose.yml down || true'
            }
        }
        stage('Copy privkey.pem') {
            steps {
                sh 'cp /var/jenkins/secrets/privkey.pem backend/'
                sh 'cp /var/jenkins/secrets/fullchain.pem backend/'
            }
        }
        stage('Build images') {
            steps {
                sh 'docker-compose -f docker-compose.yml build'
            }
        }
        stage('Run containers') {
            steps {
                sh 'docker-compose -f docker-compose.yml up -d'
            }
        }
        stage('Run tests') {
            steps {
                // Run tests here
                echo 'No tests to run'
            }
        }
    }
}