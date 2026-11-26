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
                sh '''
                    docker run --rm -v $WORKSPACE/backend:/app -w /app node:20-alpine \
                        sh -c "npm install && npm test"
                '''
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
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_PASS'
                    )
                ]) {
                    sh '''
                        echo $DH_PASS | docker login -u $DH_USER --password-stdin
                        echo 'Pushing images...'
                        docker compose push frontend backend
                        docker logout
                    '''
                }
            }
        }

        stage('Approval') {
            steps {
                script {
                    emailext(
                        to: 'nibedita01212@gmail.com',
                        subject: "Approval needed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                        body: "Approval is required for the production deployment.\nApprove here: ${env.BUILD_URL}input"
                    )
                }
                timeout(time: 1, unit: 'HOURS') {
                    // Only the user "admin" can click Approve.
                    input message: 'Deploy to production?', ok: 'Approve', submitter: 'admin'
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(credentials: ['app-server-ssh']) {
                    withCredentials([
                        string(credentialsId: 'db-password', variable: 'DB_PASSWORD')
                    ]) {
                        sh '''
                            ssh -o StrictHostKeyChecking=no $DEPLOY_HOST "mkdir -p $APP_DIR"
                            scp -o StrictHostKeyChecking=no docker-compose.yml $DEPLOY_HOST:$APP_DIR/
                            ssh -o StrictHostKeyChecking=no $DEPLOY_HOST "
                                cd $APP_DIR &&
                                printf 'DB_PASSWORD=%s\\nPOSTGRES_PASSWORD=%s\\nDOCKERHUB_USER=%s\\nTAG=%s\\n' \
                                    '$DB_PASSWORD' '$DB_PASSWORD' '$DOCKERHUB_USER' '$TAG' > .env &&
                                docker compose pull &&
                                docker compose up -d --remove-orphans
                            "
                        '''
                    }
                }
            }
        }
    }
}
