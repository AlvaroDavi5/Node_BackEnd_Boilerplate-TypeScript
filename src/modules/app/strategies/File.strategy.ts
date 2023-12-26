import { Injectable } from '@nestjs/common';
import ContentTypeConstants from '@api/constants/ContentType.constants';


@Injectable()
export default class FileStrategy {
	public defineEncoding(fileExtension: string, contentType?: string): BufferEncoding {
		const {
			text: { PLAIN: plainTextContentType, CSV: csvContentType, XML: xmlContentType },
			application: { PDF: pdfContentType, JSON: jsonContentType, ZIP: zipContentType },
			image: { GIF: gifContentType, JPEG: jpegContentType, PNG: pngContentType, SVG_XML: svgContentType },
			audio: { MPEG: mpegAudioContentType, X_WAV: wavAudioContentType },
			video: { MPEG: mpegVideoContentType, MP4: mp4ContentType, WEBM: webmContentType }
		} = new ContentTypeConstants();

		const textContents = [plainTextContentType, csvContentType, xmlContentType, jsonContentType];
		const binariesContents = [
			pdfContentType, zipContentType,
			gifContentType, jpegContentType, pngContentType, svgContentType,
			mpegAudioContentType, wavAudioContentType,
			mpegVideoContentType, mp4ContentType, webmContentType,
		];
		const binariesExtensions = ['gif', 'jpeg', 'jpg', 'png', 'svg', 'mp3', 'mp4', 'wav', 'mov', 'wmv'];

		if (contentType)
			if (textContents.includes(contentType))
				return 'utf8';
			else if (binariesContents.includes(contentType))
				return 'binary';
			else
				if (binariesExtensions.some(extension => fileExtension.includes(extension)))
					return 'binary';
		return 'utf8';
	}
}
