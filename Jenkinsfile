#!/usr/bin/env groovy

pipeline {
	agent any

	environment {
		IS_ON_CONTAINER = "TRUE"
	}

	stages {
		stage('Checkout') {
			steps {
				// This stage checks out the source code from your version control system
				checkout scm
			}
		}

		stage('Build') {
			steps {
					// This stage builds your project
					script {
						sh 'mvn clean install'
					}
			}
		}

		stage('Test') {
			steps {
					// This stage runs your tests
					script {
						sh 'mvn test'
					}
			}
		}

		stage('Deploy') {
			steps {
					// This stage deploys your application
					script {
						sh 'mvn deploy'
					}
			}
		}
	}

	post {
		success {
			// This block runs if the pipeline is successful
			echo 'Pipeline succeeded! Deploying to production...'
		}

		failure {
			// This block runs if the pipeline fails
			echo 'Pipeline failed! Notify the team...'
		}
	}
}
