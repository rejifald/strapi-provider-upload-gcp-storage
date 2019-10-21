const { Storage } = require('@google-cloud/storage')

module.exports = {
  provider: 'gcs',
  name: 'Google Cloud Storage',
  auth: {
    account: {
      label: 'Service Account JSON',
      type: 'textarea'
    },
    bucket: {
      label: 'Bucket name',
      type: 'text'
    }
  },
  init: ({ bucket, account }) => {
    const credentials = JSON.parse(account)

    const storage = new Storage({
      projectId: credentials.project_id,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key
      }
    })
      .bucket(bucket)

    return {
      upload: async (file) => {
        const bucketFile = storage.file(file.hash + file.ext.toLowerCase())

        try {
          await bucketFile.save(Buffer.from(file.buffer), {
            contentType: file.mime
          })
        } catch (e) {
          throw (e instanceof Error ? e : new Error(e))
        }

        file.url = `https://storage.googleapis.com/${bucket}/${bucketFile.name}`
      },
      delete: file => {
        throw new Error('File deletion not implemented yet')
      }
    }
  }
}
