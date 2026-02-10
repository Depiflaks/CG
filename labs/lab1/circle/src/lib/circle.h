#ifndef CIRCLE_H
#define CIRCLE_H

#include "./core/core.h"

#include <SFML/Graphics/VertexArray.hpp>
#include <cmath>
#include <cstdint>

class Circle
	: public core::Locatable
{
public:
	explicit Circle(sf::Vector2f position = { 0.f, 0.f }, int radius = 40,
		sf::Color color = sf::Color::Black)
		: core::Locatable(position)
		, m_radius(std::max(0, radius))
		, m_color(color)
	{
		Rebuild();
	}

	void SetRadius(int r)
	{
		r = std::max(0, r);
		if (r == m_radius)
			return;
		m_radius = r;
		Rebuild();
	}

	[[nodiscard]] int Radius() const
	{
		return m_radius;
	}

	void SetColor(sf::Color c)
	{
		m_color = c;
		Rebuild();
	}

	void SetThickness(float t)
	{
		t = std::max(1.f, t);
		if (t == m_thickness)
			return;
		m_thickness = t;
		Rebuild();
	}

	[[nodiscard]] float Thickness() const
	{
		return m_thickness;
	}

	void SetFillColor(sf::Color c)
	{
		m_fillColor = c;
		m_fillEnabled = true;
		Rebuild();
	}

	void DisableFill()
	{
		m_fillEnabled = false;
		Rebuild();
	}

	void EnableAntialiasing(bool enabled)
	{
		if (m_antialias == enabled)
			return;
		m_antialias = enabled;
		Rebuild();
	}

	void Rebuild()
	{
		m_outlinePoints = sf::VertexArray(sf::Points);
		m_fillPoints = sf::VertexArray(sf::Points);

		if (m_radius == 0)
		{
			if (m_fillEnabled)
			{
				sf::Vertex vf;
				vf.position = { 0.f, 0.f };
				vf.color = m_fillColor;
				m_fillPoints.append(vf);
			}
			sf::Vertex vo;
			vo.position = { 0.f, 0.f };
			vo.color = m_color;
			m_outlinePoints.append(vo);
			return;
		}

		const float r = static_cast<float>(m_radius);
		const float halfT = 0.5f * std::max(1.f, m_thickness);
		const float outer = r + halfT;
		const float inner = std::max(0.f, r - halfT);

		const int lim
			= static_cast<int>(std::ceil(outer + (m_antialias ? 2.f : 0.f)));

		for (int y = -lim; y <= lim; ++y)
		{
			for (int x = -lim; x <= lim; ++x)
			{
				const float fx = static_cast<float>(x);
				const float fy = static_cast<float>(y);
				const float d = std::sqrt(fx * fx + fy * fy);

				if (m_fillEnabled)
				{
					if (d < inner)
					{
						sf::Vertex v;
						v.position = { fx, fy };
						v.color = m_fillColor;
						m_fillPoints.append(v);
					}
					else if (m_antialias)
					{
						const float edge = inner;
						const float a = std::clamp(edge - d + 1.f, 0.f, 1.f);
						if (a > 0.f)
						{
							sf::Vertex v;
							v.position = { fx, fy };
							sf::Color c = m_fillColor;
							c.a = static_cast<sf::Uint8>(
								std::round(static_cast<float>(c.a) * a));
							v.color = c;
							m_fillPoints.append(v);
						}
					}
				}

				if (!m_antialias)
				{
					if (d >= inner && d <= outer)
					{
						sf::Vertex v;
						v.position = { fx, fy };
						v.color = m_color;
						m_outlinePoints.append(v);
					}
				}
				else
				{
					const float aOuter = std::clamp(outer - d + 1.f, 0.f, 1.f);
					const float aInner = std::clamp(d - inner + 1.f, 0.f, 1.f);
					const float a
						= std::clamp(std::min(aOuter, aInner), 0.f, 1.f);
					if (a > 0.f && d <= outer + 1.f && d >= inner - 1.f)
					{
						sf::Vertex v;
						v.position = { fx, fy };
						sf::Color c = m_color;
						c.a = static_cast<sf::Uint8>(
							std::round(static_cast<float>(c.a) * a));
						v.color = c;
						m_outlinePoints.append(v);
					}
				}
			}
		}
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states)
	{
		const auto view = target.getView();
		const sf::Vector2f vc = view.getCenter();
		const sf::Vector2f vs = view.getSize();

		const float left = vc.x - vs.x * 0.5f;
		const float top = vc.y - vs.y * 0.5f;
		const float right = vc.x + vs.x * 0.5f;
		const float bottom = vc.y + vs.y * 0.5f;

		const sf::Vector2f c = Position();
		const float r = static_cast<float>(m_radius)
			+ 0.5f * std::max(1.f, m_thickness) + (m_antialias ? 2.f : 0.f);

		if (c.x + r < left || c.x - r > right || c.y + r < top
			|| c.y - r > bottom)
			return;

		sf::VertexArray clippedFill(sf::Points);
		sf::VertexArray clippedOutline(sf::Points);

		if (m_fillPoints.getVertexCount() != 0)
		{
			clippedFill.resize(0);
			clippedFill = sf::VertexArray(sf::Points);
			clippedFill = sf::VertexArray(sf::Points);
			for (std::size_t i = 0; i < m_fillPoints.getVertexCount(); ++i)
			{
				const auto& v = m_fillPoints[i];
				const float wx = v.position.x + c.x;
				const float wy = v.position.y + c.y;
				if (wx >= left && wx <= right && wy >= top && wy <= bottom)
				{
					sf::Vertex out = v;
					out.position = { wx, wy };
					clippedFill.append(out);
				}
			}
			if (clippedFill.getVertexCount() != 0)
				target.draw(clippedFill, states);
		}

		if (m_outlinePoints.getVertexCount() != 0)
		{
			for (std::size_t i = 0; i < m_outlinePoints.getVertexCount(); ++i)
			{
				const auto& v = m_outlinePoints[i];
				const float wx = v.position.x + c.x;
				const float wy = v.position.y + c.y;
				if (wx >= left && wx <= right && wy >= top && wy <= bottom)
				{
					sf::Vertex out = v;
					out.position = { wx, wy };
					clippedOutline.append(out);
				}
			}
			if (clippedOutline.getVertexCount() != 0)
				target.draw(clippedOutline, states);
		}
	}

private:
	int m_radius = 0;
	sf::Color m_color = sf::Color::Black;

	bool m_fillEnabled = false;
	sf::Color m_fillColor = sf::Color(0, 0, 0, 0);

	bool m_antialias = true;
	float m_thickness = 3.f;

	sf::VertexArray m_outlinePoints;
	sf::VertexArray m_fillPoints;
};

#endif // CIRCLE_H
