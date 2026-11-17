pipeline {
    agent any

    options {
        timestamps()    
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        DOCKERHUB_USER = 'nibeditasatapathy'
        DEPLOY_HOST = 'ubuntu@52.62.109.174'
        APP_DIR = '/home/ubuntu/app'
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Test Backend') {
            steps {
                echo 'Testing backend...'
                sh 'cd backend && npm install && npm test'
            }
        }

        stage('Build images') {
            steps {
                echo 'Building...'
                sh 'docker compose build'
            }
        }

        stage('Push images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds', 
                    usernameVariable: 'DH_USER', 
                    passwordVariable: 'DH_PASS')]) {
                    sh ''' 
                    echo $DH_PASS | docker login -u $DH_USER --password-stdin
                    echo 'Pushing images...'
                    docker compose push frontend backend
                    docker logout
                    '''
                }             

            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
                sh '''
                ssh -o "StrictHostKeyChecking no" ${DEPLOY_HOST} "cd ${APP_DIR} && export TAG=${TAG} && docker compose pull && docker compose up -d"
                '''
            }
        }
    }
}
