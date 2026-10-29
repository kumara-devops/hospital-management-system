
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'hospital-management-system'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Node and npm') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t hospital-management-system:v1 .'
            }
        }
    }

    post {
        success {
            echo 'Hospital Management System pipeline completed!'
        }
        failure {
            echo 'Pipeline failed. Check the Jenkins console output.'
        }
    }
}
