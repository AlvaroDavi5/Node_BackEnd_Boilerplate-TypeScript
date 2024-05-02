import { Injectable } from '@nestjs/common';
import ContentTypeConstants from '@common/constants/ContentType.constants';


@Injectable()
export default class FileStrategy {
	public defineEncoding(fileName: string, contentType?: string): BufferEncoding {
		const {
			text: { PLAIN: plainTextContentType, CSV: csvContentType, XML: xmlContentType },
			application: { PDF: pdfContentType, JSON: jsonContentType, ZIP: zipContentType },
			image: { GIF: gifContentType, JPEG: jpegContentType, PNG: pngContentType, SVG_XML: svgContentType },
			audio: { MPEG: mpegAudioContentType, X_WAV: wavAudioContentType },
			video: { MPEG: mpegVideoContentType, MP4: mp4ContentType, WEBM: webmContentType },
			binariesExtensions,
		} = new ContentTypeConstants();

		const textContents = [plainTextContentType, csvContentType, xmlContentType, jsonContentType];
		const binariesContents = [
			pdfContentType, zipContentType,
			gifContentType, jpegContentType, pngContentType, svgContentType,
			mpegAudioContentType, wavAudioContentType,
			mpegVideoContentType, mp4ContentType, webmContentType,
		];

		if (contentType)
			if (textContents.includes(contentType))
				return 'utf8';
			else if (binariesContents.includes(contentType))
				return 'binary';
		if (binariesExtensions.some((extension) => fileName.includes(extension)))
			return 'binary';
		return 'utf8';
	}
}
