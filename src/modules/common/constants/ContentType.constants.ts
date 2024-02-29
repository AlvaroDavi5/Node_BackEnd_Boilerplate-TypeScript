import { Injectable } from '@nestjs/common';


@Injectable()
export default class ContentTypeConstants {
	public readonly application = {
		OCTET_STREAM: 'application/octet-stream',
		PDF: 'application/pdf',
		OGG: 'application/ogg',
		ZIP: 'application/zip',
		X_SHOCKWAVE_FLASH: 'application/x-shockwave-flash',
		JAVA_ARCHIVE: 'application/java-archive',
		JAVASCRIPT: 'application/javascript',
		JSON: 'application/json',
		XML: 'application/xml',
		XHTML_XML: 'application/xhtml+xml',
		WWW_FORM_URLENCODED: 'application/x-www-form-urlencoded',
	};

	public readonly audio = {
		MPEG: 'audio/mpeg',
		X_WAV: 'audio/x-wav',
		X_MS_WMA: 'audio/x-ms-wma',
	};

	public readonly image = {
		PNG: 'image/png',
		JPEG: 'image/jpeg',
		GIF: 'image/gif',
		SVG_XML: 'image/svg+xml',
		X_ICON: 'image/x-icon',
		VND_MICROSOFT_ICON: 'image/vnd.microsoft.icon',
	};

	public readonly text = {
		XML: 'text/xml',
		HTML: 'text/html',
		CSS: 'text/css',
		JAVASCRIPT: 'text/javascript', // obsolete
		CSV: 'text/csv',
		PLAIN: 'text/plain',
	};

	public readonly video = {
		MPEG: 'video/mpeg',
		MP4: 'video/mp4',
		WEBM: 'video/webm',
		X_MS_WMV: 'video/x-ms-wmv',
		X_FLV: 'video/x-flv',
	};

	public readonly vnd = {
		ANDROID_PACKAGE_ARCHIVE: 'application/vnd.android.package-archive',
		OASIS_OPENDOCUMENT_TEXT: 'application/vnd.oasis.opendocument.text',
		OASIS_OPENDOCUMENT_SPREADSHEET: 'application/vnd.oasis.opendocument.spreadsheet',
		OASIS_OPENDOCUMENT_PRESENTATION: 'application/vnd.oasis.opendocument.presentation',
		OASIS_OPENDOCUMENT_GRAPHICS: 'application/vnd.oasis.opendocument.graphics',
		MS_EXCEL: 'application/vnd.ms-excel',
		MS_POWERPOINT: 'application/vnd.ms-powerpoint',
		MS_WORD: 'application/msword',
		OPENXMLFORMATS_OFFICEDOCUMENT_SPREADSHEETML_SHEET: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		OPENXMLFORMATS_OFFICEDOCUMENT_PRESENTATIONML_PRESENTATION: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		OPENXMLFORMATS_OFFICEDOCUMENT_WORDPROCESSINGML_DOCUMENT: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		MOZILLA_XUL_XML: 'application/vnd.mozilla.xul+xml',
	};

	public readonly multipart = {
		MIXED: 'multipart/mixed',
		ALTERNATIVE: 'multipart/alternative',
		RELATED: 'multipart/related',
		FORM_DATA: 'multipart/form-data',
	};
}
